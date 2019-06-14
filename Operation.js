const EventEmitter = require('events')
const uuidv4 = require('uuid/v4');

const { OperationEvent } = require('./OperationEvent');
const { QueuePriority } = require('./QueuePriority');
const { copyArray } = require('./utils');

class Operation {

    constructor(id = uuidv4()) {
        this.id = id;
        this.ee = new EventEmitter();
        this._dependencies = [];
        this.completionCallback = null;
        this.map = {};
        this.isExecuting = false;
        this._done = false;
        this._isInQueue = false;
        this._canStart = false;
        this._cancelled = false;
        this.error = true;
        this.name = null;
        this._queuePriority = QueuePriority.normal;
    }

    done() {
        this._done = true;
        this.completionCallback && this.completionCallback(this);
        this.ee.emit(OperationEvent.DONE, this);
        console.log(`done: ${this.id}`);
    }

    isDone() {
        return this._done;
    }

    get isFinished() {
        return this._done;
    }
    
    cancel() {
        this._cancelled = true;
        Promise.resolve(this.promise);
        this.ee.emit(OperationEvent.CANCEL, this);
    }

    get isCancelled() {
        return this._cancelled;
    }

    set isInQueue(value) {
        this._isInQueue = value;
    }

    get isInQueue() {
        return this._isInQueue;
    }

    set queuePriority(value) {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return;
        }

        if (value >= QueuePriority.veryLow && value <= QueuePriority.veryHigh) {
            this._queuePriority = value;
        }
    }

    get queuePriority() {
        console.log(this._queuePriority);
        return this._queuePriority;
    }

    set dependencies(value) {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return;
        }

        this._dependencies = value;
    }

    get dependencies() {
        return copyArray(this._dependencies);
    }

    on(event, cb) {
        this.ee.on(event, cb);
    }

    off(event, cb) {
        this.ee.off(event, cb);
    }

    addDependency(dependency) {
        this._dependencies.push(dependency);
    }

    removeDependency(dependency) {
        this._dependencies = this._dependencies.filter(operation => operation.id !== dependency.id)
    }

    /**
     * @abstract
     * Needs to be implemented by sub-class
     * Task to be executed
     */
    async run() {
        throw new Error('run function must be implemented');
    }

    async start() {
        if (this.isExecuting || this.isCancelled) {
            return this.promise;
        }
        
        if (!this._canStart) {
            try {
                this._createMap();

                if (this._isInQueue) {
                    this.ee.emit(OperationEvent.READY, this);
                    return;
                }
            } catch (e) {
                // TODO always return promise
                return;//Promise.reject(e);
            }
        }
        
        console.log(`start: ${this.id}`);
        this.isExecuting = true;
        this.ee.emit(OperationEvent.START, this);
        this.promise = this.run()
            .then(result => {
                this.result = result;
                this.done();
                return result;
            })
            .catch(e => {
                this.isExecuting = false;
                this.error = true;
                this.ee.emit(OperationEvent.ERROR, {err:e, operation: this});
                this.ee.emit(OperationEvent.DONE, this);
            });
        return this.promise;
    }

    _createMap() {
        if (!this._dependencies.length) {
            this._canStart = true;
            return;
        }

        this._dependencies.forEach(operation => {
            this.map[operation.id] = true;
            operation.on(OperationEvent.DONE, this._onDependantOperationDone.bind(this));
            operation.start();
        });

        throw new Error();
    }

    _onDependantOperationDone(operation) {
        delete this.map[operation.id];
        this._tryStart();
    }

    _tryStart() {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return;
        }
        if (this._isEmpty(this.map)) {
            // should emit event to let operation queue that this operation can start
            // then it could check if maximum concurrent is not passed
            this._canStart = true;
            this.ee.emit(OperationEvent.READY, this);
            if (!this.isInQueue) {
                this.start();
            }
        }
    }

    _isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
}

module.exports = {
    Operation
}
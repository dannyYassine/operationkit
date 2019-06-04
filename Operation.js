const EventEmitter = require('events')
const uuidv4 = require('uuid/v4');

const { OperationEvent } = require('./OperationEvent');

class Operation {

    constructor(id = uuidv4()) {
        this.id = id;
        this.ee = new EventEmitter();
        this.dependencies = [];
        this.completionCallback = null;
        this.map = {};
        this.isExecuting = false;
        this._done = false;
        this._isInQueue = false;
        this._canStart = false;
        this.error = true;
    }

    done() {
        console.log(`done: ${this.id}`);
        this._done = true;
        this.completionCallback && this.completionCallback(this);
        this.ee.emit(OperationEvent.DONE, this);
    }

    isDone() {
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

    on(event, cb) {
        this.ee.on(event, cb);
    }

    set isInQueue(value) {
        this._isInQueue = value;
    }

    get isInQueue() {
        return this._isInQueue;
    }

    off(event, cb) {
        this.ee.off(event, cb);
    }

    /**
     * @abstract
     * Needs to be implemented by sub-class
     * Task to be executed
     */
    async run() {
        console.error('must be implemented');
        return new Promise();
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
        if (!this.dependencies.length) {
            this._canStart = true;
            return;
        }

        this.dependencies.forEach(operation => {
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
        if (this.isExecuting || this.isCancelled || this._done) {
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
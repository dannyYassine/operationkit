const EventEmitter = require('events')
const uuidv4 = require('uuid/v4');

const { OperationEvent } = require('./OperationEvent');
const { QueuePriority } = require('./QueuePriority');
const { copyArray } = require('./utils');

class Operation {

    constructor(id) {
        if (!id) {
            id = uuidv4()
        }

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
        this.promise = null;
        this.runPromise = null;
        this._queuePriority = QueuePriority.normal;

        this._resolve = null;
        this._reject = null;
    }

    done() {
        this._done = true;
        this.completionCallback && this.completionCallback(this);
        this.ee.emit(OperationEvent.DONE, this);
        console.log(`done: ${this.id}`);
        this._resolve && this._resolve(this.result);
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
        this._resolve && this._resolve();
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

        if (QueuePriority.isValid(value)) {
            this._queuePriority = value;
        }
    }

    get queuePriority() {
        return this._queuePriority;
    }

    set dependencies(value) {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return;
        }

        this._dependencies = value;
    }

    get dependencies() {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return copyArray(this._dependencies);
        }
        return this._dependencies;
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

    main() {
        this.isExecuting = true;
        this.ee.emit(OperationEvent.START, this);
        this.runPromise = this.run()
            .then(result => {
                this.result = result;
                this.done();
            })
            .catch(e => {
                this.isExecuting = false;
                this.error = true;
                this.ee.emit(OperationEvent.ERROR, {err: e, operation: this});
                this.ee.emit(OperationEvent.DONE, this);
                this._reject && this._reject();
            });
    }

    start() {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return this.promise;
        } else if (this.promise && !this._canStart) {
            this._preProcessStart();
        } else if (this.promise && this._canStart) {
            if (this._isInQueue) {
                this.ee.emit(OperationEvent.READY, this);
            } else {
                this.main();
            }
        } else {
            this.promise = new Promise((resolve, reject) => {
                this._resolve = resolve;
                this._reject = reject;
                this._preProcessStart();
            });
        }
        return this.promise;
    }

    _preProcessStart() {
        this._createMap();

        if (this._canStart) {
            if (this._isInQueue) {
                this.ee.emit(OperationEvent.READY, this);
            } else {
                this.main();
            }
        }
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
            if (this.isInQueue) {
                this.ee.emit(OperationEvent.READY, this);
            } else {
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
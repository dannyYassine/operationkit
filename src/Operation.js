const EventEmitter = require('events')
const uuidv4 = require('uuid/v4');

const { OperationEvent } = require('./OperationEvent');
const { QueuePriority } = require('./QueuePriority');
const { copyArray, isObjectEmpty } = require('./utils');

/**
 * @class Operation
 * @constructor Operation
 * @description Abstract class which runs a single task
 */
class Operation extends EventEmitter {

    /**
     * @param {number} id 
     */
    constructor(id) {
        super();
        
        if (!id) {
            id = uuidv4()
        }

        this.id = id;
        this.name = null;
        this.completionCallback = null;
        this.map = {};
        this.isExecuting = false;
        this.error = true;
        this.promise = null;
        this.runPromise = null;

        this._dependencies = [];
        this._done = false;
        this._isInQueue = false;
        this._canStart = false;
        this._cancelled = false;
        this._queuePriority = QueuePriority.normal;

        this._resolve = null;
        this._reject = null;
    }

    /**
     * @description Getter returning if Operation finished its task
     * @type {boolean}
     */
    get isFinished() {
        return this._done;
    }

    /**
     * @description Knowing if operation was cancelled
     * @type {boolean}
     */
    get isCancelled() {
        return this._cancelled;
    }

    /**
     * Setter for isInQueue value
     */
    set isInQueue(value) {
        this._isInQueue = value;
    }

    /**
     * Getter for isInQueue value
     */
    get isInQueue() {
        return this._isInQueue;
    }

    /**
     * Setter for queuePriority value.
     * It is only settable when operation has not yet executed, cancelled or finished
     */
    set queuePriority(value) {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return;
        }

        if (QueuePriority.isValid(value)) {
            this._queuePriority = value;
        }
    }

    /**
     * Getter for queuePriority value
     */
    get queuePriority() {
        return this._queuePriority;
    }

    /**
     * Setter for dependencies value.
     * It is only settable when operation has not yet executed, cancelled or finished
     */
    set dependencies(value) {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return;
        }

        this._dependencies = value;
    }

    /**
     * Getter for dependencies value.
     * When operation is executing, cancelled, or finihsed, this returns a copy
     */
    get dependencies() {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return copyArray(this._dependencies);
        }
        return this._dependencies;
    }

    /**
     * @description Cancels the operation if the operation has not started.
     * @returns {undefined}
     */
    cancel() {
        this._cancelled = true;
        Promise.resolve(this.promise);
        this.emit(OperationEvent.CANCEL, this);
        this._resolve && this._resolve();
    }

    /**
     * @description Sets the operation as done. This is usually called internally or by the operationQueue
     * @returns {undefined}
     */
    done() {
        this._done = true;
        this.completionCallback && this.completionCallback(this);
        this.emit(OperationEvent.DONE, this);
        this._resolve && this._resolve(this.result);
    }

    /**
     * @description Knowing if operation finished its task
     * @returns {boolean} 
     */
    isDone() {
        return this._done;
    }

    /**
     * Adds an operation as a dependency
     * @param {Operation} dependency 
     */
    addDependency(dependency) {
        this._dependencies.push(dependency);
    }

    /**
     * Removes an operation as a dependency
     * @param {Operation} dependency 
     */
    removeDependency(dependency) {
        this._dependencies = this._dependencies.filter(operation => operation.id !== dependency.id)
    }

    /**
     * @abstract
     * @description Needs to be implemented by sub-class
     *  This is the task to be executed
     */
    async run() {
        throw new Error('run function must be implemented');
    }

    /**
     * Method to call to execute the operation's task.
     * The operation will not run immediatly. It is evaluated at the next tick and evaluates it's depedencies
     * in order to run. Calling this method multiples times will simply re-evaluate it's readiness
     * @returns {Promise} 
     */
    start() {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return this.promise;
        } else if (this.promise && !this._canStart) {
            this._preProcessStart();
        } else if (this.promise && this._canStart) {
            if (this._isInQueue) {
                this.emit(OperationEvent.READY, this);
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

    main() {
        this.isExecuting = true;
        this.emit(OperationEvent.START, this);
        this.runPromise = this.run()
            .then(result => {
                this.result = result;
                this.done();
            })
            .catch(e => {
                this.isExecuting = false;
                this.error = true;
                this.emit(OperationEvent.ERROR, {err: e, operation: this});
                this.emit(OperationEvent.DONE, this);
                this._reject && this._reject();
            });
    }

    _preProcessStart() {
        this._createMap();

        if (this._canStart) {
            if (this._isInQueue) {
                this.emit(OperationEvent.READY, this);
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
        if (isObjectEmpty(this.map)) {
            // should emit event to let operation queue that this operation can start
            // then it could check if maximum concurrent is not passed
            this._canStart = true;
            if (this.isInQueue) {
                this.emit(OperationEvent.READY, this);
            } else {
                this.start();
            }
        }
    }

}

module.exports = {
    Operation
};
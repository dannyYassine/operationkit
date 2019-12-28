const EventEmitter = require('events');
const { CircularOperationValidator } = require('./CircularOperationValidator');
const { QueuePriority } = require('./QueuePriority');
const { QueueEvent } = require('./QueueEvent');
const { isObjectEmpty } = require('./utils');

/**
 * @class OperationQueue
 */
export class OperationQueue extends EventEmitter {

    constructor() {
        super();
        this.map = {};
        this.operations = [];
        this._processedOperations = [];
        this.resolve = null;
        this.completionCallback = null;
        this.maximumConcurentOperations = 10;

        this.readyQueueMap = {};
        this.readyQueue = [];

        this.runningQueueMap = {};
        this.runningQueue = [];

        this.queues = {
            [QueuePriority.veryHigh]: [],
            [QueuePriority.high]: [],
            [QueuePriority.normal]: [],
            [QueuePriority.low]: [],
            [QueuePriority.veryLow]: []
        }
    }

    /**
     * Getter
     * @returns {boolean}
     */
    get isExecuting() {
        return !isObjectEmpty(this.map);
    }

    /**
     * Complete the queue, this will resolve and notify its callback
     */
    done() {
        this.completionCallback && this.completionCallback();
        this.resolve();
    }

    /**
     * @param {Operation} operation
     */
    addOperation(operation) {
        this.addOperations([operation]);
    }

    /**
     * @param {Array.<Operation>} operations
     */
    addOperations(operations) {
        this.operations = this.operations.concat(operations);
        this._preProcessOperations(operations);
        this._processedOperations = this._processedOperations.concat(this.operations);
        this._begin();

        return this.promise;
    }

    /**
     * Pauses the queue, no new operations will be added to the queue
     */
    pause() {
        if (!this._paused) {
            this._paused = true;
            this.emit(QueueEvent.PAUSED, this);
        }
    }

    /**
     * Resumes the queue from an paused state
     */
    resume() {
        if (this._paused) {
            this._paused = false;
            this.emit(QueueEvent.RESUMED, this);
            this._checkNextOperation();
        }
    }

    /**
     * Getter
     * @returns {boolean}
     */
    get isPaused() {
        return this._paused;
    }

    _preProcessOperations(operations) {
        try {
            new CircularOperationValidator(operations);
        } catch (e) {
            throw e;
        }

        operations.forEach(op => {
            if (!this.map[op.id]) {
                this.map[op.id] = true;
                op.isInQueue = true;
                this._bindOperation(op);
            };
            this._preProcessOperations(op.dependencies);
        });
    }

    _bindOperation(operation) {
        operation.on('start', this._onOperationStart.bind(this));
        operation.on('ready', this._onOperationReady.bind(this));
        operation.on('cancel', this._onOperationCancel.bind(this));
        operation.on('done', this._onOperationDone.bind(this));
    }

    _unbindOperation(operation) {
        operation.off('start', this._onOperationStart.bind(this));
        operation.off('ready', this._onOperationReady.bind(this));
        operation.off('cancel', this._onOperationCancel.bind(this));
        operation.off('done', this._onOperationDone.bind(this));
    }

    _begin() {
        if (this.promise) {
            this._startOperations();
        } else {
            this.promise = new Promise((resolve, reject) => {
            
                this.resolve = resolve;

                this._startOperations();
            });
        }
    }

    _startOperations() {
        this._processedOperations.forEach(operation => {
            this._startOperation(operation);
        });
    }

    _startOperation(operation) {
        operation.start();
    }

    _onOperationStart(operation) {
        //
    }

    _onOperationReady(operation) {
        this.readyQueueMap[operation.id] = true;
        this.queues[operation.queuePriority].push(operation);
        this._checkNextOperation() 
    }

    _onOperationDone(operation) {
        this._unbindOperation(operation);

        this.runningQueue = this.runningQueue.filter(op => op.id !== operation.id);
        
        delete this.map[operation.id];
        delete this.runningQueueMap[operation.id];

        if (isObjectEmpty(this.map)) {
            this.emit(QueueEvent.DONE, this);
            this.done();
        } else {
            this._checkNextOperation();
        }
    }

    _checkNextOperation() {
        if (this._paused) {
            return;
        }

        if (this.runningQueue.length < this.maximumConcurentOperations && this.hasOperations()) {
            const operation = this.getNextOperation();
            if (operation
                 && !operation.isExecuting
                 || !operation.isCancelled
                 || !this.runningQueueMap[operation.id]) {
                this.runningQueueMap[operation.id] = true;
                this.runningQueue.push(operation);
                operation.main();
                this._checkNextOperation()
            }
        }
    }

    /**
     * @returns {boolean}
     */
    hasOperations() {
        return !!(this.queues[QueuePriority.veryHigh].length
        + this.queues[QueuePriority.high].length
        + this.queues[QueuePriority.normal].length
        + this.queues[QueuePriority.low].length
        + this.queues[QueuePriority.veryLow].length);
    }

    /**
     * Returns the next operation to be executed
     *
     * @returns {?Operation}
     */
    getNextOperation() {
        let operation = null;
        if (this.queues[QueuePriority.veryHigh].length) {
            operation = this.queues[QueuePriority.veryHigh].pop();
            return operation;
        }
        if (this.queues[QueuePriority.high].length) {
            operation = this.queues[QueuePriority.high].pop();
            return operation;
        } 
        if (this.queues[QueuePriority.normal].length) {
            operation = this.queues[QueuePriority.normal].pop();
            return operation;
        } 
        if (this.queues[QueuePriority.low].length) {
            operation = this.queues[QueuePriority.low].pop();
            return operation;
        }
        if (this.queues[QueuePriority.veryLow].length) {
            operation = this.queues[QueuePriority.veryLow].pop();
            return operation;
        }
        return operation;
    }

    _onOperationCancel(operation) {
        delete this.map[operation.id];
        delete this.queues[operation.queuePriority];
        this.operations = this.operations.filter(op => op.id !== operation.id);
        if (isObjectEmpty(this.map)) {
            this.emit(QueueEvent.DONE, this);
            this.done();
        }
    }

}
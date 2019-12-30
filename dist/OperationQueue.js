"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const CircularOperationValidator_1 = require("./CircularOperationValidator");
const OperationEvent_1 = require("./OperationEvent");
const QueuePriority_1 = require("./QueuePriority");
const QueueEvent_1 = require("./QueueEvent");
const utils_1 = require("./utils");
/**
 * @class OperationQueue
 */
class OperationQueue extends events_1.EventEmitter {
    constructor() {
        super();
        this.map = {};
        this.operations = [];
        this._processedOperations = [];
        this.resolve = null;
        this.completionCallback = null;
        this.maximumConcurrentOperations = 10;
        this.readyQueueMap = {};
        this.readyQueue = [];
        this.runningQueueMap = {};
        this.runningQueue = [];
        this.queues = {};
        this.queues[QueuePriority_1.QueuePriority.high] = [];
        this.queues[QueuePriority_1.QueuePriority.normal] = [];
        this.queues[QueuePriority_1.QueuePriority.low] = [];
        this.queues[QueuePriority_1.QueuePriority.veryLow] = [];
        this.queues[QueuePriority_1.QueuePriority.veryHigh] = [];
    }
    /**
     * Getter
     * @returns {boolean}
     */
    get isExecuting() {
        return !utils_1.isObjectEmpty(this.map);
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
        return this.addOperations([operation]);
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
            this.emit(QueueEvent_1.QueueEvent.PAUSED, this);
        }
    }
    /**
     * Resumes the queue from an paused state
     */
    resume() {
        if (this._paused) {
            this._paused = false;
            this.emit(QueueEvent_1.QueueEvent.RESUMED, this);
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
            new CircularOperationValidator_1.CircularOperationValidator(operations);
        }
        catch (e) {
            throw e;
        }
        operations.forEach((op) => {
            if (!this.map[op.id]) {
                this.map[op.id] = true;
                op.isInQueue = true;
                this._bindOperation(op);
            }
            ;
            this._preProcessOperations(op.dependencies);
        });
    }
    _bindOperation(operation) {
        operation.on(OperationEvent_1.OperationEvent.START, this._onOperationStart.bind(this));
        operation.on(OperationEvent_1.OperationEvent.READY, this._onOperationReady.bind(this));
        operation.on(OperationEvent_1.OperationEvent.CANCEL, this._onOperationCancel.bind(this));
        operation.on(OperationEvent_1.OperationEvent.DONE, this._onOperationDone.bind(this));
    }
    _unbindOperation(operation) {
        operation.off(OperationEvent_1.OperationEvent.START, this._onOperationStart.bind(this));
        operation.off(OperationEvent_1.OperationEvent.READY, this._onOperationReady.bind(this));
        operation.off(OperationEvent_1.OperationEvent.CANCEL, this._onOperationCancel.bind(this));
        operation.off(OperationEvent_1.OperationEvent.DONE, this._onOperationDone.bind(this));
    }
    _begin() {
        if (this.promise) {
            this._startOperations();
        }
        else {
            this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
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
    }
    _onOperationReady(operation) {
        this.readyQueueMap[operation.id] = true;
        this.queues[operation.queuePriority].push(operation);
        this._checkNextOperation();
    }
    _onOperationDone(operation) {
        this._unbindOperation(operation);
        this.runningQueue = this.runningQueue.filter(op => op.id !== operation.id);
        delete this.map[operation.id];
        delete this.runningQueueMap[operation.id];
        if (utils_1.isObjectEmpty(this.map)) {
            this.emit(QueueEvent_1.QueueEvent.DONE, this);
            this.done();
        }
        else {
            this._checkNextOperation();
        }
    }
    _checkNextOperation() {
        if (this._paused) {
            return;
        }
        if (this.runningQueue.length < this.maximumConcurrentOperations && this.hasOperations()) {
            const operation = this.getNextOperation();
            if (operation
                && !operation.isExecuting
                || !operation.isCancelled
                || !this.runningQueueMap[operation.id]) {
                this.runningQueueMap[operation.id] = true;
                this.runningQueue.push(operation);
                operation.main();
                this._checkNextOperation();
            }
        }
    }
    /**
     * @returns {boolean}
     */
    hasOperations() {
        return !!(this.queues[QueuePriority_1.QueuePriority.veryHigh].length
            + this.queues[QueuePriority_1.QueuePriority.high].length
            + this.queues[QueuePriority_1.QueuePriority.normal].length
            + this.queues[QueuePriority_1.QueuePriority.low].length
            + this.queues[QueuePriority_1.QueuePriority.veryLow].length);
    }
    /**
     * Returns the next operation to be executed
     *
     * @returns {?Operation}
     */
    getNextOperation() {
        let operation = null;
        if (this.queues[QueuePriority_1.QueuePriority.veryHigh].length) {
            operation = this.queues[QueuePriority_1.QueuePriority.veryHigh].pop();
            return operation;
        }
        if (this.queues[QueuePriority_1.QueuePriority.high].length) {
            operation = this.queues[QueuePriority_1.QueuePriority.high].pop();
            return operation;
        }
        if (this.queues[QueuePriority_1.QueuePriority.normal].length) {
            operation = this.queues[QueuePriority_1.QueuePriority.normal].pop();
            return operation;
        }
        if (this.queues[QueuePriority_1.QueuePriority.low].length) {
            operation = this.queues[QueuePriority_1.QueuePriority.low].pop();
            return operation;
        }
        if (this.queues[QueuePriority_1.QueuePriority.veryLow].length) {
            operation = this.queues[QueuePriority_1.QueuePriority.veryLow].pop();
            return operation;
        }
        return operation;
    }
    _onOperationCancel(operation) {
        delete this.map[operation.id];
        delete this.queues[operation.queuePriority];
        this.operations = this.operations.filter(op => op.id !== operation.id);
        if (utils_1.isObjectEmpty(this.map)) {
            this.emit(QueueEvent_1.QueueEvent.DONE, this);
            this.done();
        }
    }
}
exports.OperationQueue = OperationQueue;
//# sourceMappingURL=OperationQueue.js.map
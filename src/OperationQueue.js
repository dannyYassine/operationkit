const EventEmitter = require('events')
const { CircularOperationChecker } = require('./CircularOperationCheck');
const { QueuePriority } = require('./QueuePriority');
const { QueueEvent } = require('./QueueEvent');

class OperationQueue {

    constructor() {
        this.ee = new EventEmitter();
        this.time = {};
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

        this._isDone = false;
    }
    
    on(event, cb) {
        this.ee.on(event, cb);
    }

    off(event, cb) {
        this.ee.off(event, cb);
    }

    get totalTime() {
        return Math.abs((this.time.start.getTime() - this.time.end.getTime()) / 1000);
    }

    get isExecuting() {
        return !this._isEmpty(this.map);
    }

    done() {
        if (this._isDone) {
            return;
        }
        
        this.time.end = new Date();
        this._isDone = true;
        this.completionCallback && this.completionCallback();
        this.resolve();
    }

    /**
     * 
     * @param {Operation} operation 
     */
    addOperation(operation) {
        this.addOperations([operation]);
    }

    /**
     * 
     * @param {Array.<Operation>} operations
     */
    addOperations(operations) {
        this.operations = this.operations.concat(operations);
        this._preProcessOperations(operations);
        this._processedOperations = this._processedOperations.concat(this.operations);
        this._begin();
    }

    pause() {
        this._paused = true;
    }

    resume() {
        this._paused = false;
        this._checkNextOperation();
    }

    get isPaused() {
        return this._paused;
    }

    _preProcessOperations(operations) {
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
                try {
                    new CircularOperationChecker(this._processedOperations);
                } catch (e) {
                    return reject(e);
                }
                this.time.start = new Date();
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
        if (this.readyQueueMap[operation.id]) {
            return;
        }
        this.readyQueueMap[operation.id] = true;
        this.queues[operation.queuePriority].push(operation);

        this._checkNextOperation() 
    }

    _onOperationDone(operation) {
        this._unbindOperation(operation);

        this.runningQueue = this.runningQueue.filter(op => op.id !== operation.id);
        
        delete this.map[operation.id];
        delete this.runningQueueMap[operation.id];
        
        if (this._isEmpty(this.map)) {
            this.ee.emit(QueueEvent.DONE, this);
            this.done();
        } else {
            this._checkNextOperation();
        }
    }

    _checkNextOperation() {
        if (this._paused) {
            return;
        }

        if (this.runningQueue.length < this.maximumConcurentOperations && this._hasOperations()) {
            const operation = this._getNextOperation();
            if (!operation.isExecuting || !operation.isCancelled || !this.runningQueueMap[operation.id]) {
                this.runningQueueMap[operation.id] = true;
                this.runningQueue.push(operation);
                operation.main();
                this._checkNextOperation()
            }
        }
    }

    _hasOperations() {
        return !!(this.queues[QueuePriority.veryHigh].length
        + this.queues[QueuePriority.high].length
        + this.queues[QueuePriority.normal].length
        + this.queues[QueuePriority.low].length
        + this.queues[QueuePriority.veryLow].length);
    }

    _getNextOperation() {
        if (this.queues[QueuePriority.veryHigh].length) {
            return this.queues[QueuePriority.veryHigh].pop();
        } else if (this.queues[QueuePriority.high].length) {
            return this.queues[QueuePriority.high].pop();
        } else if (this.queues[QueuePriority.normal].length) {
            return this.queues[QueuePriority.normal].pop();
        } else if (this.queues[QueuePriority.low].length) {
            return this.queues[QueuePriority.low].pop();
        } else if (this.queues[QueuePriority.veryLow].length) {
            return this.queues[QueuePriority.veryLow].pop();
        }
    }


    _onOperationCancel(operation) {
        delete this.map[operation.id];
        if (this._isEmpty(this.map)) {
            this.ee.emit(QueueEvent.DONE, this);
            this.done();
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
    OperationQueue
}
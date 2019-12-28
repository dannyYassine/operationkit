import { EventEmitter } from 'events';
import { CircularOperationValidator } from './CircularOperationValidator';
import { OperationEvent} from './OperationEvent';
import { QueuePriority } from './QueuePriority';
import { QueueEvent } from './QueueEvent';
import { isObjectEmpty } from './utils';
import { Operation } from './Operation';

/**
 * @class OperationQueue
 */
export class OperationQueue extends EventEmitter {

    public map: Object;
    public operations: Operation<any>[];
    public resolve: Function;
    public reject: Function;
    public completionCallback: Function;
    public maximumConcurrentOperations: number;
    public readyQueueMap: Object;
    public readyQueue: Object;
    public runningQueueMap: Object;
    public runningQueue: Operation<any>[];
    public queues: Object;
    public promise: Promise<any>;
    private _paused:boolean;
    private _processedOperations: Operation<any>[];

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
        this.queues[QueuePriority.high] = [];
        this.queues[QueuePriority.normal] = [];
        this.queues[QueuePriority.low] = [];
        this.queues[QueuePriority.veryLow] = [];
        this.queues[QueuePriority.veryHigh] = [];
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
    addOperation(operation: Operation<any>): Promise<any> {
        return this.addOperations([operation]);
    }

    /**
     * @param {Array.<Operation>} operations
     */
    addOperations(operations: Operation<any>[]): Promise<any> {
        this.operations = this.operations.concat(operations);
        this._preProcessOperations(operations);
        this._processedOperations = this._processedOperations.concat(this.operations);
        this._begin();

        return this.promise;
    }

    /**
     * Pauses the queue, no new operations will be added to the queue
     */
    pause(): void {
        if (!this._paused) {
            this._paused = true;
            this.emit(QueueEvent.PAUSED, this);
        }
    }

    /**
     * Resumes the queue from an paused state
     */
    resume(): void {
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
    get isPaused(): boolean {
        return this._paused;
    }

    private _preProcessOperations(operations: Operation<any>[]) {
        try {
            new CircularOperationValidator(operations);
        } catch (e) {
            throw e;
        }

        operations.forEach((op: Operation<any>) => {
            if (!this.map[op.id]) {
                this.map[op.id] = true;
                op.isInQueue = true;
                this._bindOperation(op);
            };
            this._preProcessOperations(op.dependencies);
        });
    }

    private _bindOperation(operation: Operation<any>) {
        operation.on(OperationEvent.START, this._onOperationStart.bind(this));
        operation.on(OperationEvent.READY, this._onOperationReady.bind(this));
        operation.on(OperationEvent.CANCEL, this._onOperationCancel.bind(this));
        operation.on(OperationEvent.DONE, this._onOperationDone.bind(this));
    }

    private _unbindOperation(operation: Operation<any>) {
        operation.off(OperationEvent.START, this._onOperationStart.bind(this));
        operation.off(OperationEvent.READY, this._onOperationReady.bind(this));
        operation.off(OperationEvent.CANCEL, this._onOperationCancel.bind(this));
        operation.off(OperationEvent.DONE, this._onOperationDone.bind(this));
    }

    private _begin() {
        if (this.promise) {
            this._startOperations();
        } else {
            this.promise = new Promise((resolve, reject) => {

                this.resolve = resolve;
                this.reject = reject;

                this._startOperations();
            });
        }
    }

    private _startOperations() {
        this._processedOperations.forEach(operation => {
            this._startOperation(operation);
        });
    }

    private _startOperation(operation: Operation<any>) {
        operation.start();
    }

    private _onOperationStart(operation): void {

    }

    private _onOperationReady(operation: Operation<any>): void {
        this.readyQueueMap[operation.id] = true;
        this.queues[operation.queuePriority].push(operation);
        this._checkNextOperation()
    }

    private _onOperationDone(operation: Operation<any>): void {
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

    private _checkNextOperation(): void {
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
                this._checkNextOperation()
            }
        }
    }

    /**
     * @returns {boolean}
     */
    public hasOperations(): boolean {
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
    public getNextOperation(): Operation<any> {
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

    private _onOperationCancel(operation: Operation<any>): void {
        delete this.map[operation.id];
        delete this.queues[operation.queuePriority];
        this.operations = this.operations.filter(op => op.id !== operation.id);
        if (isObjectEmpty(this.map)) {
            this.emit(QueueEvent.DONE, this);
            this.done();
        }
    }

}
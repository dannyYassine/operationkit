/// <reference types="node" />
import { EventEmitter } from 'events';
import { Operation } from './Operation';
/**
 * @class OperationQueue
 */
export declare class OperationQueue extends EventEmitter {
    map: Object;
    operations: Operation<any>[];
    resolve: Function;
    reject: Function;
    completionCallback: Function;
    maximumConcurrentOperations: number;
    readyQueueMap: Object;
    readyQueue: Object;
    runningQueueMap: Object;
    runningQueue: Operation<any>[];
    queues: Object;
    promise: Promise<any>;
    private _paused;
    private _processedOperations;
    constructor();
    /**
     * Getter
     * @returns {boolean}
     */
    get isExecuting(): boolean;
    /**
     * Complete the queue, this will resolve and notify its callback
     */
    done(): void;
    /**
     * @param {Operation} operation
     */
    addOperation(operation: Operation<any>): Promise<any>;
    /**
     * @param {Array.<Operation>} operations
     */
    addOperations(operations: Operation<any>[]): Promise<any>;
    /**
     * Pauses the queue, no new operations will be added to the queue
     */
    pause(): void;
    /**
     * Resumes the queue from an paused state
     */
    resume(): void;
    /**
     * Getter
     * @returns {boolean}
     */
    get isPaused(): boolean;
    private _preProcessOperations;
    private _bindOperation;
    private _unbindOperation;
    private _begin;
    private _startOperations;
    private _startOperation;
    private _onOperationStart;
    private _onOperationReady;
    private _onOperationDone;
    private _checkNextOperation;
    /**
     * @returns {boolean}
     */
    hasOperations(): boolean;
    /**
     * Returns the next operation to be executed
     *
     * @returns {?Operation}
     */
    getNextOperation(): Operation<any>;
    private _onOperationCancel;
}

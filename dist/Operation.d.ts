/// <reference types="node" />
import { QueuePriority } from './QueuePriority';
import { EventEmitter } from 'events';
/**
 * @class Operation
 * @constructor Operation
 * @description Abstract class which runs a single task
 */
export declare abstract class Operation<T> extends EventEmitter {
    id: string;
    result: T;
    name: string;
    completionCallback?: Function;
    map: Object;
    isExecuting: boolean;
    error: boolean;
    promise?: Promise<any>;
    runPromise?: Promise<any>;
    private _dependencies;
    private _done;
    private _isInQueue;
    private _canStart;
    private _cancelled;
    private _resolve;
    private _reject;
    private _queuePriority;
    private _dependentResultMap;
    /**
     * @param {number} [id]
     */
    constructor(id?: any);
    /**
     * @description Getter returning if Operation finished its task
     * @returns {boolean}
     */
    get isFinished(): boolean;
    /**
     * @description Knowing if operation was cancelled
     * @returns {boolean}
     */
    get isCancelled(): boolean;
    /**
     * Setter for isInQueue value
     * @param {boolean} value
     */
    set isInQueue(value: boolean);
    /**
     * Getter for isInQueue value
     */
    get isInQueue(): boolean;
    /**
     * Setter for queuePriority value.
     * It is only settable when operation has not yet executed, cancelled or finished
     * @param {QueuePriority} value
     */
    set queuePriority(value: QueuePriority);
    /**
     * Getter for queuePriority value
     * @returns {QueuePriority|number}
     */
    get queuePriority(): QueuePriority;
    /**
     * Setter for dependencies value.
     * It is only settable when operation has not yet executed, cancelled or finished
     * @param {Array.<Operation>} operations
     */
    set dependencies(operations: Operation<any>[]);
    /**
     * Getter for dependencies value.
     * When operation is executing, cancelled, or finished, this returns a copy
     * @returns {Array.<Operation>}
     */
    get dependencies(): Operation<any>[];
    /**
     * @abstract
     * @description Needs to be implemented by sub-class
     *  This is the task to be executed
     */
    abstract run(): Promise<T>;
    /**
     * @description Cancels the operation if the operation has not started.
     * @returns {undefined}
     */
    cancel(): void;
    /**
     * @description Sets the operation as done. This is usually called internally or by the operationQueue
     * @returns {undefined}
     */
    done(): void;
    /**
     * @description Knowing if operation finished its task
     * @returns {boolean}
     */
    isDone(): boolean;
    /**
     * Adds an operation as a dependency
     * @param {Operation} dependency
     * @param {string?} property
     */
    addDependency(dependency: Operation<any>, property?: string): void;
    /**
     * Removes an operation as a dependency
     * @param {Operation} dependency
     */
    removeDependency(dependency: Operation<any>): void;
    /**
     * Method to call to execute the operation's task.
     * The operation will not run immediatly. It is evaluated at the next tick and evaluates it's depedencies
     * in order to run. Calling this method multiples times will simply re-evaluate it's readiness
     * @returns {Promise}
     */
    start(): Promise<T>;
    /**
     */
    main(): void;
    private _preProcessStart;
    private _createMap;
    private _onDependantOperationDone;
    private _tryStart;
}

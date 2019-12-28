import {QueuePriority} from './QueuePriority';

import {EventEmitter} from 'events';
import { v4 as uuidv4 } from 'uuid';

import {OperationEvent} from './OperationEvent';
import {copyArray, isObjectEmpty} from './utils';

/**
 * @class Operation
 * @constructor Operation
 * @description Abstract class which runs a single task
 */
export abstract class Operation<T> extends EventEmitter {

    public id: string;
    public result: T;
    public name: string;
    public completionCallback?: Function;
    public map: Object;
    public isExecuting: boolean;
    public error: boolean;
    public promise?: Promise<any>;
    public runPromise?: Promise<any>;

    private _dependencies: Operation<any>[];
    private _done: boolean;
    private _isInQueue: boolean;
    private _canStart: boolean;
    private _cancelled: boolean;
    private _resolve: Function;
    private _reject: Function;
    private _queuePriority: QueuePriority = QueuePriority.normal;

    /**
     * @param {number} [id]
     */
    constructor(id = null) {
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

        this._resolve = null;
        this._reject = null;
    }

    /**
     * @description Getter returning if Operation finished its task
     * @returns {boolean}
     */
    get isFinished(): boolean {
        return this._done;
    }

    /**
     * @description Knowing if operation was cancelled
     * @returns {boolean}
     */
    get isCancelled(): boolean {
        return this._cancelled;
    }

    /**
     * Setter for isInQueue value
     * @param {boolean} value
     */
    set isInQueue(value) {
        this._isInQueue = value;
    }

    /**
     * Getter for isInQueue value
     */
    get isInQueue(): boolean {
        return this._isInQueue;
    }

    /**
     * Setter for queuePriority value.
     * It is only settable when operation has not yet executed, cancelled or finished
     * @param {QueuePriority} value
     */
    set queuePriority(value: QueuePriority) {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return;
        }
        if (value in QueuePriority) {
            this._queuePriority = value;
        }
    }

    /**
     * Getter for queuePriority value
     * @returns {QueuePriority|number}
     */
    get queuePriority(): QueuePriority {
        return this._queuePriority;
    }

    /**
     * Setter for dependencies value.
     * It is only settable when operation has not yet executed, cancelled or finished
     * @param {Array.<Operation>} operations
     */
    set dependencies(operations: Operation<any>[]) {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return;
        }

        this._dependencies = operations;
    }

    /**
     * Getter for dependencies value.
     * When operation is executing, cancelled, or finished, this returns a copy
     * @returns {Array.<Operation>}
     */
    get dependencies(): Operation<any>[] {
        if (this.isExecuting || this.isCancelled || this.isFinished) {
            return copyArray(this._dependencies);
        }
        return this._dependencies;
    }

    /**
     * @abstract
     * @description Needs to be implemented by sub-class
     *  This is the task to be executed
     */
    abstract async run(): Promise<T>;

    /**
     * @description Cancels the operation if the operation has not started.
     * @returns {undefined}
     */
    public cancel(): void {
        this._cancelled = true;
        Promise.resolve(this.promise);
        this.emit(OperationEvent.CANCEL, this);
        this._resolve && this._resolve();
    }

    /**
     * @description Sets the operation as done. This is usually called internally or by the operationQueue
     * @returns {undefined}
     */
    public done(): void {
        this._done = true;
        this.completionCallback && this.completionCallback(this);
        this.emit(OperationEvent.DONE, this);
        this._resolve && this._resolve(this.result);
    }

    /**
     * @description Knowing if operation finished its task
     * @returns {boolean} 
     */
    public isDone(): boolean {
        return this._done;
    }

    /**
     * Adds an operation as a dependency
     * @param {Operation} dependency 
     */
    public addDependency(dependency: Operation<any>): void {
        this._dependencies.push(dependency);
    }

    /**
     * Removes an operation as a dependency
     * @param {Operation} dependency 
     */
    public removeDependency(dependency: Operation<any>): void {
        this._dependencies = this._dependencies.filter(operation => operation.id !== dependency.id)
    }

    /**
     * Method to call to execute the operation's task.
     * The operation will not run immediatly. It is evaluated at the next tick and evaluates it's depedencies
     * in order to run. Calling this method multiples times will simply re-evaluate it's readiness
     * @returns {Promise} 
     */
    public start(): Promise<T> {
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

    /**
     */
    public main(): void {
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

    private _preProcessStart(): void {
        this._createMap();

        if (this._canStart) {
            if (this._isInQueue) {
                this.emit(OperationEvent.READY, this);
            } else {
                this.main();
            }
        }
    }

    private _createMap(): void {
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

    private _onDependantOperationDone(operation): void {
        delete this.map[operation.id];
        this._tryStart();
    }

    private _tryStart(): void {
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
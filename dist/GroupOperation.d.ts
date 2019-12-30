import { Operation } from './Operation';
import { OperationQueue } from './OperationQueue';
declare type GroupResult = any[];
/**
 * @class GroupOperation
 */
export declare class GroupOperation<U> extends Operation<any> {
    operations: Operation<any>[];
    queue: OperationQueue;
    constructor();
    /**
     * @override
     *
     * @returns {Promise}
     */
    run(): Promise<GroupResult>;
    /**
     * @override
     */
    start(): Promise<any>;
    /**
     * @param {Operation} operation
     */
    addOperation(operation: Operation<any>): void;
    /**
     * @param {Array.<Operation>} operations
     */
    addOperations(operations: Operation<any>[]): void;
}
export {};

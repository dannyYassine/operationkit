import { Operation } from './Operation';
export declare class CircularOperationValidator {
    private operations;
    /**
     * @param {Array.<Operation>} operations
     */
    constructor(operations: Operation<any>[]);
    _checkCircular(): void;
    _checkDependencies(operation: Operation<any>, mapHash: Object): void;
    /**
     * @param {Operation} op
     * @param map
     * @private
     */
    _verifyOpMap(op: Operation<any>, map: Object): void;
    _throwError(op: Operation<any>, map: Object): void;
}

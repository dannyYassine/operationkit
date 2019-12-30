import { Operation } from './Operation';

class CircularOperationValidatorError extends Error {
    constructor(message: string) {
        super();
        this.message = message;
    }
}

export class CircularOperationValidator {

    private operations: Operation<any>[];

    /**
     * @param {Array.<Operation>} operations
     */
    constructor(operations: Operation<any>[]) {
        this.operations = operations;
        this._checkCircular();
    }

    _checkCircular() {
        this.operations.forEach((operation: Operation<any>) => {
            operation.dependencies.forEach(op => {
                let map: Object = {};
                map[operation.id] = Object.keys(map).length;
                this._verifyOpMap(op, map);                
                this._checkDependencies(op, map)
            });
        });
    }

    _checkDependencies(operation: Operation<any>, mapHash: Object) {
        operation.dependencies.forEach((op: Operation<any>) => {
            let map = JSON.parse(JSON.stringify(mapHash));
            this._verifyOpMap(op, map);
            this._checkDependencies(op, map)
        })
    }

    /**
     * @param {Operation} op
     * @param map
     * @private
     */
    _verifyOpMap(op: Operation<any>, map: Object) {
        if (map[op.id] !== undefined) {
            this._throwError(op, map)
        }

        map[op.id] = Object.keys(map).length;
    }

    _throwError(op: Operation<any>, map: Object) {
            let mapValues = {};
            for (let key in map) {
                const value = map[key];
                mapValues[value] = key;
            }

            const values = Object.values(mapValues);
            values.push(op.id);
            throw new CircularOperationValidatorError(`Circular: ${values}`);
    }

}
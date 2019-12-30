"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CircularOperationValidatorError extends Error {
    constructor(message) {
        super();
        this.message = message;
    }
}
class CircularOperationValidator {
    /**
     * @param {Array.<Operation>} operations
     */
    constructor(operations) {
        this.operations = operations;
        this._checkCircular();
    }
    _checkCircular() {
        this.operations.forEach((operation) => {
            operation.dependencies.forEach(op => {
                let map = {};
                map[operation.id] = Object.keys(map).length;
                this._verifyOpMap(op, map);
                this._checkDependencies(op, map);
            });
        });
    }
    _checkDependencies(operation, mapHash) {
        operation.dependencies.forEach((op) => {
            let map = JSON.parse(JSON.stringify(mapHash));
            this._verifyOpMap(op, map);
            this._checkDependencies(op, map);
        });
    }
    /**
     * @param {Operation} op
     * @param map
     * @private
     */
    _verifyOpMap(op, map) {
        if (map[op.id] !== undefined) {
            this._throwError(op, map);
        }
        map[op.id] = Object.keys(map).length;
    }
    _throwError(op, map) {
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
exports.CircularOperationValidator = CircularOperationValidator;
//# sourceMappingURL=CircularOperationValidator.js.map
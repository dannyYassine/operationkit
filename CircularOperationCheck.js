
class CircularOperationError extends Error {
    constructor(message = 'Circular dependency') {
        super()
        this.message = message;
    }
}

class CircularOperationChecker {

    constructor(operations) {
        this.operations = operations
        this._checkCircular();
    }

    _checkCircular() {
        this.operations.forEach(operation => {
            operation.dependencies.forEach(op => {
                let map = {};
                map[operation.id] = Object.keys(map).length;
                this._verifyOpMap(op, map);                
                this._checkDependencies(op, map)
            });
        });
    }

    _checkDependencies(operation, mapHash) {
        operation.dependencies.forEach(op => {
            let map = JSON.parse(JSON.stringify(mapHash));
            this._verifyOpMap(op, map);
            this._checkDependencies(op, map)
        })
    }

    _verifyOpMap(op, map) {
        if (map[op.id] !== undefined) {
            this._throwError(op, map)
        }

        map[op.id] = Object.keys(map).length;
    }

    _throwError() {
        let keys = Object.keys(map);

            let values = {};
            for (let key in map) {
                const value = map[key];
                values[value] = key;
            }

            values = Object.values(values);
            values.push(op.id);
            throw new CircularOperationError(`Circular: ${values}`);
    }

}

module.exports = {
    CircularOperationChecker
}
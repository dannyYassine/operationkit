class OperationQueue {
    constructor() {
        this.map = {};
        this.operations = [];
        this.completionCallback = null;
    }

    /**
     * 
     * @param {Operation} operation 
     */
    addOperation(operation) {
        this.operations.push(operation);
        this._begin();
    }

    /**
     * 
     * @param {Operation} operation 
     */
    addOperations(operations) {
        this.operations = this.operations.concat(operations);
        this._begin();
    }

    _begin() {
        this.operations.forEach(operation => {
            this._createOperationMap(operation);
            operation.start();
        });
    }

    _createOperationMap(operation) {
        operation.dependencies.forEach(op => {
            this._createOperationMap(op);
        });
    }

    _startOperation(operation) {
        operation.on('start', this._onOperationStart.bind(this));
        operation.on('done', this._OnoperationDone.bind(this));
        operation.start();
    }

    _onOperationStart(operation) {
        
    }

    _OnoperationDone(operation) {
        operation.dependencies.forEach(op => {
            this._startOperation(op);
        })
    }
}

module.exports = {
    OperationQueue
}
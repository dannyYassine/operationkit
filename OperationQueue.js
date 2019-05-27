const { CircularOperationChecker } = require('./CircularOperationCheck');

class OperationQueue {
    constructor() {
        this.map = {};
        this.operations = [];
        this.resolve = null;
        this.completionCallback = null;
        this.maximumConcurentOperations = null;
        this.queue = [];
    }

    get isExecuting() {
        return !this._isEmpty(this.map);
    }

    done() {
        this.completionCallback && this.completionCallback();
        this.resolve();
    }

    /**
     * 
     * @param {Operation} operation 
     */
    async addOperation(operation) {
        if (this.isExecuting) return;
        return this.addOperations([operation]);
    }

    /**
     * 
     * @param {Operation} operation 
     */
    async addOperations(operations) {
        if (this.isExecuting) return;
        this.operations = this.operations.concat(operations);
        return this._begin();
    }

    _begin() {
        return new Promise((resolve, reject) => {
            try {
                new CircularOperationChecker(this.operations);
            } catch (e) {
                return reject(e);
            }
            this.resolve = resolve;
            
            this.operations.forEach(operation => {
                this.map[operation.id] = true;
                this._startOperation(operation);
            });
        });
    }

    _startOperation(operation) {
        operation.on('start', this._onOperationStart.bind(this));
        operation.on('cancel', this._onOperationCancel.bind(this));
        operation.on('done', this._onOperationDone.bind(this));
        operation.start();
    }

    _onOperationStart(operation) {
        
    }

    _onOperationDone(operation) {
        delete this.map[operation.id];
        if (this._isEmpty(this.map)) {
            this.done();
        }
    }

    _onOperationCancel(operation) {
        delete this.map[operation.id];
        if (this._isEmpty(this.map)) {
            this.done();
        }
    }

    _isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
}

module.exports = {
    OperationQueue
}
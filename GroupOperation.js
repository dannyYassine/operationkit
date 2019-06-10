const { Operation } = require('./Operation');
const { OperationQueue } = require('./OperationQueue');

class GroupOperation extends Operation {

    // /**
    //  * @var {OperationQueue}
    //  */
    // queue;

    // /**
    //  * @var {Array.<Operation>}
    //  */
    // operations;

    constructor() {
        super();
        this.queue = new OperationQueue();    
        this.operations = [];
    }

    /**
     * @override
     * 
     * @returns {Promise}
     */
    run() {
        this.dependencies = this.dependencies;
        this.operations.push(this);
        return this.operations.addOperations(this.operations);
    }

    /**
     * @param {Operation} operation 
     */
    addOperation(operation) {
        this.operations.push(operation);
    }

    /**
     * @param {Array.<Operation>} operation 
     */
    addOperations(operations) {
        this.operations = this.operations.concat(operations);
    }
}

module.exports = {
    GroupOperation
}
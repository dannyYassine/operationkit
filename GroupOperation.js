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
        return this.queue.addOperations(this.operations.concat([this]));
    }

    /**
     * @param {Operation} operation 
     */
    addOperation(operation) {
        this.operations.push(operation);
        this.dependencies = this.operations;
    }

    /**
     * @param {Array.<Operation>} operation 
     */
    addOperations(operations) {
        this.operations = this.operations.concat(operations);
        this.dependencies = this.operations;
    }
}

module.exports = {
    GroupOperation
}
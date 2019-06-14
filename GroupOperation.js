const { Operation } = require('./Operation');
const { OperationQueue } = require('./OperationQueue');

class GroupOperation extends Operation {

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
    async run() {
        await this.queue.addOperations(this.operations)

        return this.operations.reduce((accum, operation) => {
            accum.push(operation.result);
            return accum;
        }, []);           
    }

    /**
     * @override
     */
    async start() {
        this.dependencies = [];
        return super.start();
    }

    /**
     * @param {Operation} operation 
     */
    addOperation(operation) {
        this.operations.push(operation);
        this.dependencies = [];
    }

    /**
     * @param {Array.<Operation>} operation 
     */
    addOperations(operations) {
        this.operations = this.operations.concat(operations);
        this.dependencies = [];
    }
}

module.exports = {
    GroupOperation
}
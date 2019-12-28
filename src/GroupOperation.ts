import { Operation } from './Operation';
import { OperationQueue } from './OperationQueue';

type GroupResult = any[];

/**
 * @class GroupOperation
 */
export class GroupOperation extends Operation<any> {

    public operations: Operation<any>[];
    public queue: OperationQueue;

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
    public async run(): Promise<GroupResult> {
        await this.queue.addOperations(this.operations);

        const accum: GroupResult = [];
        return this.operations.reduce((accum, operation) => {
            accum.push(operation.result);
            return accum;
        }, accum);
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
     * @param {Array.<Operation>} operations
     */
    addOperations(operations) {
        this.operations = this.operations.concat(operations);
        this.dependencies = [];
    }
}
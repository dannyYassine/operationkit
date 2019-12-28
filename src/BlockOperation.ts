import { Operation } from './Operation';

type BlockResult = any[] | any;

/**
 * Operation Subclass that accepts a function as an argument which will be the task to run.
 * Additionally, multiple functions can be appended to run simultaneously as the same task.
 */
class BlockOperation extends Operation<any> {

    public blocks: Function[];

    constructor() {
        let id;
        let block;

        const first = arguments[0];
        if (typeof first === 'number') {
            id = first;
            const second = arguments[1];
            if (typeof second === 'function') {
                block = second;
            }
        } else if (typeof first === 'function') {
            block = first;
        } else {
            throw new Error('Wrong arguments passed: missing ID and/or function');
        }
        
        super(id);
        this.blocks = [block];
    }

    /**
     *
     */
    async run(): Promise<BlockResult> {
        const promises: any[] = [];
        this.blocks.forEach(block => {
            promises.push(block(this));
        });

        const results: any[] = await Promise.all(promises);
        return results.length === 1
            ? results[0]
            : results;
    }

    /**
     * Append another function to run simultaneously as the same task
     * @param {function} block - function to add 
     */
    addBlock(block: Function) {
        this.blocks.push(block);
    }
}

module.exports = {
    BlockOperation
};
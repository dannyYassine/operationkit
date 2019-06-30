const { Operation } = require('./Operation');

/**
 * Operation Subclass that accepts a function as an argument which will be the task to run.
 * Additionally, multiple functions can be appended to run simultaneously as the same task.
 */
class BlockOperation extends Operation {

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
     * @ignore
     */
    run() {
        const promises = [];
        this.blocks.forEach(block => {
            promises.push(block());
        });
        return Promise.all(promises);
    }

    /**
     * Append another function to run simultaneously as the same task
     * @param {function} block - function to add 
     */
    addBlock(block) {
        if (typeof block === 'function') {
            this.blocks.push(block);
        }
    }
}

module.exports = {
    BlockOperation
}
const { Operation } = require('./Operation');

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

    run() {
        const promises = [];
        this.blocks.forEach(block => {
            promises.push(block());
        });
        return Promise.all(promises);
    }

    addBlock(block) {
        if (typeof block === 'function') {
            this.blocks.push(block);
        }
    }
}

module.exports = {
    BlockOperation
}
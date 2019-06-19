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
        }
        
        super(id);
        this.block = block;
    }

    run() {
        return this.block();
    }
}

module.exports = {
    BlockOperation
}
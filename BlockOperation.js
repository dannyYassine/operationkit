const { Operation } = require('./Operation');

class BlockOperation extends Operation {

    constructor(id, block) {
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
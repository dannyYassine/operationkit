const { Operation } = require('../Operation');

class TestOperation extends Operation {
    async run() {
        this.result = `my result - ${this.id}`;
        return this.result;
    }
}

module.exports = {
    TestOperation
}
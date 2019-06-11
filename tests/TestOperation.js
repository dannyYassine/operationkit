const { Operation } = require('../Operation');

class TestOperation extends Operation {
    async run() {
        return 'my result';
    }
}

module.exports = {
    TestOperation
}
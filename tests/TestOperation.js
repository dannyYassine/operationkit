const { Operation } = require('../src/Operation');
const { delay } = require('./utils');

class TestOperation extends Operation {
    async run() {
        this.result = `my result - ${this.id}`;
        return this.result;
    }
}

class TimeOutOperation extends Operation {

    constructor(time) {
        super();
        this.timer = time;
    }

    async run() {
        return delay(this.time)
    }
}

module.exports = {
    TestOperation,
    TimeOutOperation
}
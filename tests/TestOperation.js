const { Operation } = require('../src/Operation');
const { delay } = require('./utils');

class TestOperation extends Operation {
    async run() {
        this.result = `my result - ${this.id}`;
        return this.result;
    }
}

class TimeOutOperation extends Operation {

    constructor(time, resultToReturn = null) {
        super();
        if (!time) {
            time = Math.random() * 1000;
        }
        this.time = time;
        this.resultToReturn = resultToReturn;
    }

    async run() {
        await delay(this.time)
        return this.resultToReturn
    }
}

module.exports = {
    TestOperation,
    TimeOutOperation
}
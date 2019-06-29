const { Operation } = require('../src/Operation');
const { GroupOperation } = require('../src/GroupOperation');

class TimeOutOperation extends Operation {
    async run() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('hello');
            }, 500)
        });
    }
}

const groupOperation = new GroupOperation();
operation1 = new TimeOutOperation();
operation2 = new TimeOutOperation();
groupOperation.addOperations([operation1, operation2]);

groupOperation.then(() => {
    console.log('done');
});

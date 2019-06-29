const { Operation } = require('../Operation');
const { OperationQueue } = require('../OperationQueue');
const { QueuePriority } = require('../QueuePriority');

class TimeOutOperation extends Operation {
    async run() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('hello');
            }, 500)
        });
    }
}

const queue = new OperationQueue();
operation1 = new TimeOutOperation();
operation1.queuePriority = QueuePriority.low;
operation2 = new TimeOutOperation();
operation1.queuePriority = QueuePriority.veryHigh;

queue.on('done', () => {
    console.log('done');
})

queue.addOperation(operation1);
queue.addOperation(operation2);


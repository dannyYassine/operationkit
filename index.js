
const { Operation } = require('./Operation');
const { BlockOperation } = require('./BlockOperation');
const { OperationQueue } = require('./OperationQueue');

// operation
// operation queues
// operation with block
const axios = require('axios');

class DownloadDataOperation extends Operation {

    async run() {
        try {
            const response = await axios.get('https://samples.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=b6907d289e10d714a6e88b30761fae22');
            const data = response.data;
            return this.id;
        } catch (e) {
            this.cancel();
        }
    }
}

class TimeOutOperation extends Operation {

    constructor(id, time = 1000) {
        super(id);
        this.time = time; 
    }

    async run() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, this.time);
        })
    }

}

const blockOperation = new BlockOperation(6, async () => {
    const response = await axios.get('https://samples.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=b6907d289e10d714a6e88b30761fae22');
    const data = response.data;
    return data;
});

const operation = new DownloadDataOperation(1);
const operation2 = new DownloadDataOperation(2);
const operation3 = new DownloadDataOperation(3);
const operation4 = new TimeOutOperation(4, 2000);
const operation5 = new TimeOutOperation(5, 5000);

operation.dependencies = [operation2];
operation2.dependencies = [operation4];
operation3.dependencies = [operation5, operation2];
operation4.dependencies = [operation5];
operation5.dependencies = [blockOperation];

// operation2.dependencies = [operation3];

// operation.on('start', op => {
//     console.log('start', op.id);
// });
// operation.on('done', op => {
//     console.log('done', op.id);
// });
// operation.on('error', (err, op) => {
//     console.log('error', op.id);
// });
// operation.completionCallback = () => {
//     // console.log('done')
// }

const operationQueue = new OperationQueue();
// operationQueue.addOperation(operation);
operationQueue.addOperations([operation, operation3]);
// operation.start();
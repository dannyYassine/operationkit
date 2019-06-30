## operationkit

[![Version](https://img.shields.io/npm/v/operationkit.svg)](https://www.npmjs.com/package/operationkit)

[![Coverage Status](https://coveralls.io/repos/github/dannyYassine/operationkit/badge.svg?branch=master)](https://coveralls.io/github/dannyYassine/operationkit?branch=master)
[![Build Status](https://travis-ci.org/dannyYassine/operationkit.svg?branch=master)](https://travis-ci.org/dannyYassine/operationkit)
[![install size](https://packagephobia.now.sh/badge?p=operationkit)](https://packagephobia.now.sh/result?p=operationkit)
![npm bundle size](https://img.shields.io/bundlephobia/min/operationkit.svg)
[![Downloads](https://img.shields.io/npm/dm/operationkit.svg)](https://npm-stat.com/charts.html?package=operationkit)
[![Dependencies](https://img.shields.io/david/dannyyassine/operationkit.svg)](https://david-dm.org/dannyyassine/operationkit)

Inspired by [Operation](https://developer.apple.com/documentation/foundation/operation) and [OperationQueue](https://developer.apple.com/documentation/foundation/operationqueue) classes from Apple's Foundation framework for macOS, iOS, watchOS, and tvOS.

Universal package for the browser and node.js

## Installation

with node:

```
npm install operationkit
```

with yarn:

```
yarn add operationkit
```

with cdn:

```
<script src="https://unpkg.com/operationkit/dist/operationkit.min.js"></script>

// then
window.operationkit
```
![npm bundle size](https://img.shields.io/bundlephobia/min/operationkit.svg)

## Documentation

[Go to documentation](https://dannyyassine.github.io/operationkit/docs/index.html)

## Classes

* [Operation](#operation) 
* [OperationQueue](#operation-queue)
* [BlockOperation](#blockoperation)
* [GroupOperation](#groupoperation)

## Use

```javascript
const {
    Operation,
    OpreationQueue,
    BlockOperation,
    GroupOperation,
    OperationEvent,
    QueueEvent,
    QueuePriority
} = require('operationkit');
```

## Operation

An abstract class that represents a single task.

```javascript
const operation = new Operation();

const result = await operation.start();
```

### Add dependencies

The operation will execute only when all dependencies are resolved.

```javascript
operation1.dependencies = [operation2];
operation1.start()
```

Console:

```
// operation2 started
// operation2 done
// operation1 started
// operation1 done
```

### Extend the Operation class for complex tasks

```javascript
class ValidateTokenOperation extends Operation {
    
    /**
     * Method to implement to run custom task
     * @override
     * @returns {Promise}
     */
    async run() {
        let token = localStorage.getItem('token');
        if (!token) {
            const response = await axios('<refresh_token_api>');
            token = reponse.data;
            localStorage.setItem('token', token);
        }
        return token;
    }
    
}
```

The `run` function must always return a **promise**.

```javascript
run() {
    return new Promise((resolve, reject) => {
        const response = await axios.get('<some_api>');
        resolve(response.data);
    })
}
```

or simply use **async** keyword when overriding the function.

```javascript
async run() {
    const response = await axios.get('<some_api>');
    return response.data
}
```

### Example

```javascript
class DownloadDataOperation extends Operation {

    /**
     * @override
     */
    async run() {
        try {
            const response = await axios.get('<some_api>');
            return response.data;
        } catch (e) {
            this.cancel();
        }
    }
}
```

TO NOTE: you must always return the result from the async function or Promise.resolve. You will have access to the result from the the result property or from resolving your promise.

```javascript
const downloadOperation = new DownloadDataOperation();

// result is returned from your promise here
const data = await new DownloadDataOperation();

// and the same result is available from
downloadOperation.result;
```

### Create a collection of complex operations that represents your application

```javascript
const validateToken = new ValidateTokenOperation();
const getUsersApi = new GetUsersApi();

getUsersApi.dependencies = [validateToken];
getUsersApi.completionCallback = operation => {
    // operation.result;
};

getUsersApi.start()
    .then(result => { ... })
    .catch(e => { ... });
```

Or set the dependency directly in the subclass:

```javascript
class GetUsersApi extends Operation {
    constructor() {
        this.dependencies = [new ValidateTokenOperation()];
    }
}
```

### Operation Events

* **OperationEvent.START**	Operation has started to run the task
* **OperationEvent.READY** Operation is ready to be executed
* **OperationEvent.DONE** Operation is finished running the task
* **OperationEvent.CANCEL** Operation was cancelled
* **OperationEvent.ERROR** An error occured while running the task

```javascript
apiOperation.on(OperationEvent.START, (operation) => {
	console.log(operation);
})
```

## OperationQueue

A queue orchestrates the execution of operations. An operation queue executes its queued Operation objects based on their priority and readiness*.

```javascript
const operationQueue = new OperationQueue();

const operation1 = new ApiOperation();

const operation2 = new ApiOperation();

operationQueue.addOperations([operation1, operation2]);
```

### Utilizing OperationQueue's maximum concurrent operations

```javascript
operationQueue.maximumConcurentOperations = 2;
```

Console:

```
// operation1 started
// operation2 started
// operation1 done
// operation2 done
```

### Queue Priority

Specify the relative ordering of operations that are waiting to be started in an operation queue.

```javascript
QueuePriority.veryHigh
QueuePriority.high
QueuePriority.normal
QueuePriority.low
QueuePriority.veryLow
```

These constants let you prioritize the order in which operations execute:

```javascript
const getCacheData = new GetCacheDataOperation();
getCacheData.queuePriority = QueuePriority.high;

const downloaHighRestImage = new DownloaHighRestImageOperation();
getCacheData.queuePriority = QueuePriority.normal;

operationQueue.addOperations([getCacheData, downloaHighRestImage]);
```

Console:

```
// getCacheData started
// getCacheData done
// downloaHighRestImage started
// downloaHighRestImage done
```

### Inserting operations in a queue to control flow

```javascript
const blockOperation6 = new BlockOperation(6, async () => {
    const response = await axios.get('https://samples.openweathermap.org/data/2.5/weather?lat=35&lon=139&appid=b6907d289e10d714a6e88b30761fae22');
    const data = response.data;
    return data;
});

const operation = new DownloadDataOperation(1);
const operation2 = new DownloadDataOperation(2);
const operation3 = new DownloadDataOperation(3);
const operation4 = new TimeOutOperation(4, 2000);
const operation5 = new TimeOutOperation(5, 1000);
const operation7 = new TimeOutOperation(7, 8000);
const operation8 = new TimeOutOperation(8, 1500);

operation.dependencies = [operation2, operation7];
operation2.dependencies = [operation4, operation8];
operation3.dependencies = [operation, operation5, operation2];
operation4.dependencies = [operation5, blockOperation6];
operation5.dependencies = [blockOperation6];
operation8.dependencies = [operation7];

const operationQueue = new OperationQueue();
operationQueue.maximumConcurentOperations = 10;

operationQueue.completionCallback = () => {
    console.log('queue done');
};

operationQueue.addOperations([operation3]);
    
```

### OperationQueue Events

* **OperationEvent.DONE** OperationQueue has finished running all operations
* **OperationEvent.PAUSED** OperationQueue has paused
* **OperationEvent.RESUMED** OperationQueue has resumed

```javascript
queue.on(OperationEvent.PAUSED, (operationQueue) => {
	console.log(operationQueue);
})
```

## BlockOperation

A helper class that accepts a function which will be exexuted as the operation's task.

```javascript
const operation = new BlockOperation(async () => {
    return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve('my operation result');
            }, 1000);
        })
});

const result = await operation.start()
console.log(result) // 'my operation result'
```

## GroupOperation

Group multiple operations and return the result of each operation when they are all resolved.

```javascript
const groupOperation = new GroupOperation();

groupOperation.addOperation(new GetUsersApi());
groupOperation.addOperation(new GetPostsApi());

const [users, posts] = await groupOperation.start();
```

QueuePriorities are also considered when using GroupOperation.

## Run tests

```bash
npm run test
```

## Run coverage

```bash
npm run test-coverage
```

## Run new build

```bash
npm run build
```

## Run generate documentation

```bash
npm run docs
```

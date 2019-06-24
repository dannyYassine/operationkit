# operationkit

[![Coverage Status](https://coveralls.io/repos/github/dannyYassine/operationkit/badge.svg?branch=master)](https://coveralls.io/github/dannyYassine/operationkit?branch=master)
[![Build Status](https://travis-ci.org/dannyYassine/operationkit.svg?branch=master)](https://travis-ci.org/dannyYassine/operationkit)
[![Version](https://img.shields.io/npm/v/operationkit.svg)](https://www.npmjs.com/package/operationkit)
[![install size](https://packagephobia.now.sh/badge?p=operationkit)](https://packagephobia.now.sh/result?p=operationkit)

Inspried by [Operation](https://developer.apple.com/documentation/foundation/operation) and [OperationQueue](https://developer.apple.com/documentation/foundation/operationqueue) classes from the iOS Framework.

## Installation

```
npm install operationkit
```

## Classes

* Operation
* BlockOperation
* OperationQueue
* GroupOperation

## Operation

An abstract class that represents a single task.

```
const operation = new Operation();

const result = await operation.start();
```

### Extend the Operation class for complex tasks

```
class ValidateTokenOperation extends Operation {
    
    /**
     * Method to implement to run custom task
     * @override
     */
    run() {
        [...]
    }
    
}
```

### Add dependencies

```
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

### Create a list of complex operations that represents your application

```
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

```
class GetUsersApi extends Operation {
    constructor() {
        this.dependencies = [new ValidateTokenOperation()];
    }
}
```

## OperationQueue
A queue orchestrates the execution of operations. An operation queue executes its queued Operation objects based on their priority and readiness*.

```
const operationQueue = new OperationQueue();

const operation1 = new BlockOperation(1, async () => {
    [...]
});

const operation2 = new BlockOperation(2, async () => {
    [...]
});

operationQueue.addOperations([operation1, operation2]);
```

### Utilizing OperationQueue's maximum concurrent operations

```
operationQueue.maximumConcurentOperations = 2;
```

Console:

```
// operation1 started
// operation2 started
// operation1 done
// operation2 done
```


### Inserting operations in a queue to control flow

```
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

operationQueue.addOperations([operation3])
    .then(result => {
        console.log(result)
    })
    .catch(e => {
        console.log(e)
    });
```

### Queue Priority

Specify the relative ordering of operations that are waiting to be started in an operation queue.

```
QueuePriority.veryHigh
QueuePriority.high
QueuePriority.normal
QueuePriority.low
QueuePriority.veryLow
```

These constants let you prioritize the order in which operations execute:

```
const getCacheData = new getCacheDataOperation();
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

## BlockOperation: A Helper Class that accepts a function

```
const operation = new BlockOperation(6, async () => {
    return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        })
});

operation.start()
```

## GroupOperation

Group multiple operations and return the result of each operation when they are all resolved.

```
const groupOperation = new GroupOperation();

groupOperation.addOperation(new GetUsersApi());
groupOperation.addOperation(new GetPostsApi());

const [users, posts] = await groupOperation.start();
```

QueuePriorities are also considered when using GroupOperation.



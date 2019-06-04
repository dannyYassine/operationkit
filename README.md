# operations-js

Inspried by [Operation](https://developer.apple.com/documentation/foundation/operation) and [OperationQueue](https://developer.apple.com/documentation/foundation/operationqueue) classes from the iOS Framework.

### Operation

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

### OperationQueue

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

### Add dependencies

```
operation1.dependencies = [operation2];
operation1.start()
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

### Create a list of complex operations that represents your application

```
const validateToken = new ValidateTokenOperation();
const getUsersApi = new GetUsersApi();

getUsersApi.dependencies = [validateToken];
getUsersApi.completionCallback = operation => {
    // operation.result;
};
getUsersApi.start()
    .then(operation => { ... })
    .catch(e => { ... });
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

### Utilizing OperationQueue's maximum concurrent operations

```
operationQueue.maximumConcurentOperations = 10;
// total time : 4.958 secondes

operationQueue.maximumConcurentOperations = 1
// total time : 6.35 secondes
```



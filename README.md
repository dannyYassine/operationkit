# operations.js

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
    return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        })
});

const operation2 = new BlockOperation(2, async () => {
    return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, 1000);
        })
});

operation.addOperations([operation1, operation2]);
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
const validateTokenOperation = new ValidateTokenOperation();
const someApiOperation = new SomeApiOperation();

someApiOperation.dependencies = [validateTokenOperation];

someApiOperation.start()
```




# operations.js

Inspried by [Operation](https://developer.apple.com/documentation/foundation/operation) and [OperationQueue](https://developer.apple.com/documentation/foundation/operationqueue) classes from the iOS Framework.

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


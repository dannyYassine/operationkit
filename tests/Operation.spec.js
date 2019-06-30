const { OperationQueue } = require('../src/OperationQueue');
const { Operation } = require('../src/Operation');
const { OperationEvent } = require('../src/OperationEvent');
const { QueuePriority } = require('../src/QueuePriority');
const { TestOperation } = require('./TestOperation');

describe('Operation', () => {

    describe('function Operation', () => {

        test('should be defined', () => {
            expect(Operation).toBeDefined();
        });
    
        test('should be instantiated', () => {
            const operation = new Operation();
    
            expect(operation).toBeDefined();
        });
    
        test('inherits from Object', () => {
            const operation = new Operation();
            
            expect(operation.__proto__.__proto__.constructor.name).toBe('Object');
        });
    
        test('should be valid type', () => {
            const operation = new Operation();
    
            expect(operation.constructor.name).toBe('Operation');
        });
    });

    describe('function constructor', () => {
        test('it should accept an ID if only a number if passed as first argument', () => {
            const operation = new Operation(1);

            expect(operation.id).toBe(1);
        });
    });

    describe('function start', function () {

        test('must throw error when internal run function was never implemented', async (done) => {
            const operation = new Operation();
            
            try {
                const result = await operation.start()
            } catch (e) {
                done();
            }
        });
    
        test('start function must return a promise', () => {
            const operation = new TestOperation();

            const promise = operation.start()
            
            expect(promise.constructor).toBe(Promise);
        });
    
        test('start function must return a promise', () => {
            const operation = new TestOperation();

            const promise = operation.start()
            
            expect(promise.constructor).toBe(Promise);
        });
    
        test('start function success returns data set to result property', async (done) => {
            const operation = new TestOperation();
    
            try {
                const result = await operation.start()
    
                expect(operation.result).toBe(`my result - ${operation.id}`);
                done();
            } catch (e) {
                // failled
            }
        });
    
        test('start function returns data from promise', async (done) => {
            const operation = new Operation();
            operation.run = async () => { return 'my result' };
    
            try {
                const result = await operation.start()
                expect(result).toBe('my result');
                done();
            } catch (e) {
                // failled
            }
        });

        test('when operation is executing, must set required properties', () => {
            const operation = new TestOperation();

            operation.start();

            expect(operation.isExecuting).toBeTruthy();
        });

        test('should try to start when ready', () => {
            
        });

        test('should not try to start when already executing', () => {
            
        });

        test('should not try to start when already cancelled', () => {
            
        });

        test('should not try to start when already finished', () => {
            
        });
    });

    describe('function cancel', () => {

        test('when operation is cancelled, must set required properties', () => {
            const operation = new TestOperation();
            operation.start();

            operation.cancel();

            expect(operation.isCancelled).toBeTruthy();
        });

        test('when operation is cancelled, must set required private properties', () => {
            const operation = new TestOperation();
            operation.start();

            operation.cancel();

            expect(operation._cancelled).toBeTruthy();
        });

        test('when operation is cancelled, must resolve promise', async (done) => {
            const operation = new TestOperation();
   
            operation.start();
            operation.cancel();
            operation.start()
                .then((result) => {
                    done();
                });
        });

        test('event OperationEvent.CANCEL must be emitted when operation is cancelled', () => {
            const emittedFunction = jest.fn(() => {});
            const operation = new TestOperation();
            operation.on(OperationEvent.CANCEL, emittedFunction);

            operation.cancel();

            expect(emittedFunction).toHaveBeenCalledWith(operation);
        });
    });

    describe('when an operation is done', () => {

        test('it must set required properties', async () => {
            const operation = new TestOperation();
            
            try {
                await operation.start();
            } catch (e) {
                // fail
            }

            expect(operation.isDone()).toBeTruthy();
            expect(operation.isFinished).toBeTruthy();
        });

        test('it must set private properties', async () => {
            const operation = new TestOperation();
            
            try {
                await operation.start();
            } catch (e) {
                // fail
            }

            expect(operation._done).toBeTruthy();
        });

        test('completionCallback is called', async () => {
            const completionCallback = jest.fn(() => {});
            const operation = new TestOperation();
            operation.completionCallback = completionCallback;
            try {
                await operation.start();
            } catch (e) {
                // fail
            }

            expect(completionCallback).toHaveBeenCalledWith(operation);
        });
    });

    describe('event: OperationEvent.START', () => {
        test('event must be emitted when operation has started', () => {
            const emittedFunction = jest.fn(() => {});
            const operation = new TestOperation();
            operation.on(OperationEvent.START, emittedFunction);

            operation.start();

            expect(emittedFunction).toHaveBeenCalledWith(operation);
        });
    });

    describe('event: OperationEvent.CANCEL', () => {
        test('event must be emitted when operation has cancelled', () => {
            const emittedFunction = jest.fn(() => {});
            const operation = new TestOperation();
            operation.on(OperationEvent.CANCEL, emittedFunction);

            operation.cancel();

            expect(emittedFunction).toHaveBeenCalledWith(operation);
        });
    });

    describe('event: OperationEvent.READY', () => {
        test('when in an OperationQueue, event must be emitted when operation is ready to be executed', () => {
            const queue = new OperationQueue();

            const emittedFunction = jest.fn(() => {});
            const operation = new TestOperation();
            operation.on(OperationEvent.READY, emittedFunction);

            queue.addOperation(operation);

            expect(emittedFunction).toHaveBeenCalledWith(operation);
        });

        test('when calling directly the start function outside an OperationQueue, event must NOT be emitted', () => {
            const emittedFunction = jest.fn(() => {});
            const operation = new TestOperation();
            operation.on(OperationEvent.READY, emittedFunction);

            operation.start();

            expect(emittedFunction).not.toHaveBeenCalledWith(operation);
        });
    });

    describe('event: OperationEvent.DONE', () => {
        test('event must be emitted when operation is finished executing', async () => {
            const emittedFunction = jest.fn(() => {});
            const operation = new TestOperation();
            operation.on(OperationEvent.DONE, emittedFunction);

            try {
                await operation.start();
            } catch (e) {
                //
            }
            
            expect(emittedFunction).toHaveBeenCalledWith(operation);
        });
    });

    describe('event: OperationEvent.ERROR', () => {
        test('event must be emitted when something went wrong during the opreations task', async () => {
            const emittedFunction = jest.fn(() => {});
            const operation = new Operation();
            const error = new Error('test error');
            operation.run = async () => { throw error };
            operation.on(OperationEvent.ERROR, emittedFunction);

            try {
                await operation.start();
            } catch (e) {
                // fail
            }

            expect(emittedFunction).toHaveBeenCalled();
            const { err, operation: returnedOperation } = emittedFunction.mock.calls[0][0];
            expect(err).toEqual(error);
            expect(returnedOperation).toEqual(operation);
        });
    });

    describe('operation with dependencies', () => {
        it('operation must start after all dependencies are resolved', async () => {
            const operation1 = new TestOperation(1);
            const operation2 = new TestOperation(2);
            operation1.dependencies = [operation2];

            let copyOperationState1 = null;
            operation2.completionCallback = op => {
                const { isCancelled, isExecuting, isFinished } = operation1;
                copyOperationState1 = { isCancelled, isExecuting, isFinished };
            }

            const promise = operation1.start();

            await promise;

            expect(copyOperationState1.isExecuting).toBe(false);
            expect(copyOperationState1.isFinished).toBe(false);
            expect(copyOperationState1.isCancelled).toBe(false);

            expect(operation1.isExecuting).toBe(true);
            expect(operation2.isExecuting).toBe(true);

            expect(operation1.isFinished).toBe(true);
            expect(operation2.isFinished).toBe(true);
        });
    });

    describe('function addDependency', () => {
        it('should add operation dependency', async () => {
            const operation1 = new TestOperation();
            const operation2 = new TestOperation();

            operation1.addDependency(operation2);

            expect(operation1.dependencies.length).toBe(1);
            expect(operation1.dependencies[0].id).toBe(operation2.id);
        });
    });

    describe('function removeDependency', () => {
        it('should remove operation dependency', async () => {
            const operation1 = new TestOperation();
            const operation2 = new TestOperation();
            const operation3 = new TestOperation();
            operation1.addDependency(operation2);
            operation1.addDependency(operation3);

            operation1.removeDependency(operation2);

            expect(operation1.dependencies.length).toBe(1);
            expect(operation1.dependencies[0].id).toBe(operation3.id);

            operation1.removeDependency(operation3);

            expect(operation1.dependencies.length).toBe(0);
            expect(operation1.dependencies).toEqual([]);
        });
    });

    describe('property dependencies', () => {
        test('should return a clone when getting dependencies when executing', () => {
            const operation1 = new TestOperation();
            const operation2 = new TestOperation();
            operation1.addDependency(operation2);

            operation1.main();

            let dependencies = operation1.dependencies;

            expect(dependencies).not.toBe(operation1.dependencies);
        });

        test('should set dependencies', () => {
            const operation1 = new TestOperation();
            const operation2 = new TestOperation();

            operation1.dependencies = [operation2];

            expect(operation1.dependencies).toEqual([operation2]);
        });

        test('should not set dependencies when operation is executing', () => {
            const operation1 = new TestOperation();
            const operation2 = new TestOperation();
            operation1.isExecuting = true;

            operation1.dependencies = [operation2];

            expect(operation1.dependencies).toEqual([]);
        });

        test('should not set dependencies when operation is cancelled', () => {
            const operation1 = new TestOperation();
            const operation2 = new TestOperation();
            
            operation1.cancel();
            operation1.dependencies = [operation2];

            expect(operation1.dependencies).toEqual([]);
        });

        test('should not set dependencies when operation is finished', () => {
            const operation1 = new TestOperation();
            const operation2 = new TestOperation();

            operation1.done()
            operation1.dependencies = [operation2];

            expect(operation1.dependencies).toEqual([]);
        });
    })

    describe('function on', () => {
        test('should add callback as a subscriber', async (done) => {
            const operation1 = new TestOperation();

            operation1.on(OperationEvent.START, () => {
                done();
            });
            operation1.start();
        });
    });

    describe('function off', () => {
        test('should remove callback from subscriber', async (done) => {
            const mockFunction = jest.fn(() => {
            });
            const operation1 = new TestOperation();
            operation1.on(OperationEvent.START, mockFunction);

            operation1.off(OperationEvent.START, mockFunction);
            await operation1.start();

            expect(mockFunction).not.toHaveBeenCalled();
            done();
        });
    });

    describe('property queuePriority', function () {
        test('should set valid queue priority', () => {
            const operation = new Operation();

            operation.queuePriority = QueuePriority.high;

            expect(operation.queuePriority).toBe(QueuePriority.high);
        });

        test('should not set queue priority while executing', () => {
            const operation = new Operation();
            operation.queuePriority = QueuePriority.high;

            operation.isExecuting = true;
            operation.queuePriority = QueuePriority.normal;

            expect(operation.queuePriority).toBe(QueuePriority.high);
            expect(operation.queuePriority).not.toBe(QueuePriority.normal);
        });

        test('should not set queue priority when cancelled', () => {
            const operation = new Operation();
            operation.queuePriority = QueuePriority.high;

            operation.cancel();
            operation.queuePriority = QueuePriority.normal;

            expect(operation.queuePriority).toBe(QueuePriority.high);
            expect(operation.queuePriority).not.toBe(QueuePriority.normal);
        });

        test('should not set queue priority when finished', () => {
            const operation = new Operation();
            operation.queuePriority = QueuePriority.high;

            operation.done();
            operation.queuePriority = QueuePriority.normal;

            expect(operation.queuePriority).toBe(QueuePriority.high);
            expect(operation.queuePriority).not.toBe(QueuePriority.normal);
        });

        test('should set queue priortiy if it is a valid value', () => {
            const operation = new Operation();

            operation.queuePriority = QueuePriority.veryHigh;
            expect(operation.queuePriority).toBe(QueuePriority.veryHigh);
            
            operation.queuePriority = QueuePriority.high;
            expect(operation.queuePriority).toBe(QueuePriority.high);
            
            operation.queuePriority = QueuePriority.normal;
            expect(operation.queuePriority).toBe(QueuePriority.normal);

            operation.queuePriority = QueuePriority.low;
            expect(operation.queuePriority).toBe(QueuePriority.low);

            operation.queuePriority = QueuePriority.veryLow;
            expect(operation.queuePriority).toBe(QueuePriority.veryLow);
        });

        test('should not set queue priortiy if it is not a valid value', () => {
            const operation = new Operation();

            operation.queuePriority = 'some random value';
            expect(operation.queuePriority).toBe(QueuePriority.normal);

            operation.queuePriority = 123232132;
            expect(operation.queuePriority).toBe(QueuePriority.normal);

            operation.queuePriority = -123232132;
            expect(operation.queuePriority).toBe(QueuePriority.normal);
        });
    });
});
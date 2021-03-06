const { OperationQueue } = require('../OperationQueue');
const { QueueEvent } = require('../QueueEvent');
const { TestOperation, TimeOutOperation } = require('./TestOperation');
const { QueuePriority } = require('../QueuePriority');
const { Operation } = require('../Operation');
const { OperationEvent } = require('../OperationEvent');
const { delay, nextTick } = require('./utils');

describe('OperationQueue', () => {

    describe('function OperationQueue', function () {
        test('should be defined', () => {
            expect(OperationQueue).toBeDefined();
        });

        test('should be instantiated', () => {
            const operationQueue = new OperationQueue(1);

            expect(operationQueue).toBeDefined();
        });

        test('inherits from EventEmitter', () => {
            const operationQueue = new OperationQueue(1);

            expect(operationQueue.__proto__.__proto__.constructor.name).toBe('EventEmitter');
        });

        test('should be valid type', () => {
            const operationQueue = new OperationQueue(1);

            expect(operationQueue.constructor.name).toBe('OperationQueue');
        });
    });

    describe('function addOperation', () => {
        test('should add a single operation to its operations prop', () => {
            const operationQueue = new OperationQueue(1);
            const operation1 = new TestOperation();

            operationQueue.addOperation(operation1);

            expect(operationQueue.operations).toEqual([operation1]);
        });
    });

    describe('function addOperations', () => {
        test('should add multiple operations to its operations prop', () => {
            const operationQueue = new OperationQueue(1);
            const operation1 = new TestOperation();
            const operation2 = new TestOperation();

            operationQueue.addOperations([operation1, operation2]);

            expect(operationQueue.operations).toEqual([operation1, operation2]);
        })
    });

    describe('function pause', function () {
        test('should set/get property isPaused', () => {
            const operationQueue = new OperationQueue();

            operationQueue.pause();

            expect(operationQueue.isPaused).toEqual(true);
        });

        test('should not start any newly added opeations when queue is paused', () => {
            const operationQueue = new OperationQueue();
            const operation1 = new TestOperation();

            operationQueue.pause();
            operationQueue.addOperation(operation1);

            expect(operationQueue.runningQueue.length).toBe(0);
        });

        test('should emit paused event', () => {
            const pausedFunction = jest.fn(() => {
            });
            const operationQueue = new OperationQueue();
            operationQueue.on(QueueEvent.PAUSED, pausedFunction)

            operationQueue.pause();

            expect(pausedFunction).toHaveBeenCalled();
        });

        test('should emit paused event only once', () => {
            const pausedFunction = jest.fn(() => {
            });
            const operationQueue = new OperationQueue();
            operationQueue.on(QueueEvent.PAUSED, pausedFunction)

            operationQueue.pause();
            operationQueue.pause();
            operationQueue.pause();
            operationQueue.pause();

            expect(pausedFunction).toHaveBeenCalledTimes(1);
        });
    });

    describe('function off', () => {
        test('should remove callback from subscriber', async (done) => {
            const mockFunction = jest.fn(() => {
            });
            const operationQueue = new OperationQueue();

            operationQueue.on(OperationEvent.START, mockFunction);
            operationQueue.off(OperationEvent.START, mockFunction);
            operationQueue.pause();
            await nextTick();

            expect(mockFunction).not.toHaveBeenCalled();
            done();
        });
    });

    describe('function resume', function () {
        test('should un-set/get property isPaused', () => {
            const operationQueue = new OperationQueue();

            operationQueue.pause();
            operationQueue.resume();

            expect(operationQueue.isPaused).toEqual(false);
        });

        test('should start opeations when queue is un-paused', () => {
            const operationQueue = new OperationQueue();
            const operation1 = new TestOperation();
            const operation2 = new TestOperation();

            operationQueue.addOperation(operation1);
            operationQueue.pause();

            expect(operationQueue.runningQueue.length).toBe(1);

            operationQueue.addOperation(operation2);

            expect(operationQueue.runningQueue.length).toBe(1);

            operationQueue.resume();

            expect(operationQueue.runningQueue.length).toBe(2);
        });

        test('should emit resumed event', () => {
            const resumedFunction = jest.fn(() => {
            });
            const operationQueue = new OperationQueue();
            operationQueue.on(QueueEvent.RESUMED, resumedFunction)
            operationQueue.pause();

            operationQueue.resume();

            expect(resumedFunction).toHaveBeenCalled();
        });

        test('should emit resumed event only once', () => {
            const resumedFunction = jest.fn(() => {
            });
            const operationQueue = new OperationQueue();
            operationQueue.on(QueueEvent.PAUSED, resumedFunction)
            operationQueue.pause();

            operationQueue.resume();
            operationQueue.resume();

            expect(resumedFunction).toHaveBeenCalledTimes(1);
        });
    });

    describe('adding operations while queue is still executing', () => {
        test('should add operations seperatly, at any given time', () => {
            const operationQueue = new OperationQueue();
            const operation1 = new TestOperation();
            const operation2 = new TestOperation();

            operationQueue.addOperation(operation1);
            expect(operationQueue.runningQueue.length).toBe(1);

            operationQueue.addOperations([operation2]);
            expect(operationQueue.runningQueue.length).toBe(2);
        });

        test('should add operations seperatly, at any given time (with a longer delay this time)', async (done) => {
            const operationQueue = new OperationQueue();
            const operation1 = new TimeOutOperation(1500);
            const operation2 = new TimeOutOperation(1000);

            operationQueue.addOperation(operation1);
            expect(operationQueue.runningQueue.length).toBe(1);

            await delay(1);

            operationQueue.addOperations([operation2]);
            expect(operationQueue.runningQueue.length).toBe(2);

            done();
        });

        test('should add operations seperatly, at any given time and emit event DONE when all finished', async (done) => {
            const operationQueue = new OperationQueue();
            const operation1 = new TimeOutOperation(1500);
            const operation2 = new TimeOutOperation(1000);

            operationQueue.addOperation(operation1);
            expect(operationQueue.runningQueue.length).toBe(1);

            await delay(1);

            operationQueue.addOperations([operation2]);
            expect(operationQueue.runningQueue.length).toBe(2);

            operationQueue.on(QueueEvent.DONE, queue => {
                expect(queue.hasOperations()).toBe(false);
                done();
            });
        });
    });

    describe('function addOperation/addOperations', () => {
        test('should throw error when operation are dependent form each other', async (done) => {
            const operationQueue = new OperationQueue();
            const operation1 = new TestOperation();
            const operation2 = new TestOperation();

            operation1.dependencies = [operation2];
            operation2.dependencies = [operation1];

            try {
                operationQueue.addOperation(operation1);
                await nextTick();
                fail('should have failed');
            } catch (e) {
                expect(e.constructor.name === 'CircularOperationValidatorError').toBe(true);
                done();
            }
        });

        test('properties before calling start', () => {
            const operationQueue = new OperationQueue();

            expect(operationQueue.isExecuting).toBe(false);
        });

        test('properties while running operations', () => {
            const operationQueue = new OperationQueue();
            const operation1 = new TimeOutOperation(500);

            operationQueue.addOperation(operation1)

            expect(operationQueue.isExecuting).toBe(true);
        });

        test('properties after running operations', async () => {
            const operationQueue = new OperationQueue();
            const operation1 = new TestOperation();

            operationQueue.addOperation(operation1)
            await delay(500);

            expect(operationQueue.isExecuting).toBe(false);
        });

        test('properties after running multiple operations', async (done) => {
            const operationQueue = new OperationQueue();
            const operation1 = new TestOperation();
            const operation2 = new TimeOutOperation(500);

            operationQueue.addOperation(operation1)
            await nextTick();
            operationQueue.addOperation(operation2)

            operationQueue.on(QueueEvent.DONE, () => {
                expect(operationQueue.isExecuting).toBe(false);
                done();
            })

        });

        test('should call done event when queue becomes empty', async (done) => {
            const operationQueue = new OperationQueue();
            const operation1 = new TestOperation();
            const doneFn = jest.fn(() => {
                done();
            });
            operationQueue.on(QueueEvent.DONE, doneFn);

            operationQueue.addOperation(operation1);

            await nextTick();

            expect(doneFn).toHaveBeenCalledTimes(1);
        });

        test('should call done once event when queue becomes empty', async () => {
            const operationQueue = new OperationQueue();
            const operation1 = new TestOperation();
            const doneFn = jest.fn(() => {
            });
            operationQueue.on(QueueEvent.DONE, doneFn);

            operationQueue.addOperation(operation1);
        });

        test('should call promise resolve when operations are re-added', async () => {
            const operationQueue = new OperationQueue();
            const operation1 = new TestOperation();
            const operation2 = new TestOperation();
            const doneFn = jest.fn(() => {
            });

            operationQueue.on(QueueEvent.DONE, doneFn);

            operationQueue.addOperation(operation1);
            operationQueue.addOperation(operation2)

            await nextTick();

            expect(doneFn).toHaveBeenCalledTimes(1);
        });

        test('should set order queue priority of operations', (done) => {
            const operationQueue = new OperationQueue();
            operationQueue.maximumConcurrentOperations = 1;

            const operation1 = new TestOperation();
            operation1.queuePriority = QueuePriority.veryHigh;
            const operation2 = new TestOperation();
            operation2.queuePriority = QueuePriority.high;
            const operation3 = new TestOperation();
            operation3.queuePriority = QueuePriority.normal;
            const operation4 = new TestOperation();
            operation4.queuePriority = QueuePriority.low;
            const operation5 = new TestOperation();
            operation5.queuePriority = QueuePriority.veryLow;

            const doneOperations = [];
            operation1.on(OperationEvent.DONE, () => {
                doneOperations.push(operation1);
            });
            operation2.on(OperationEvent.DONE, () => {
                doneOperations.push(operation2);
            });
            operation3.on(OperationEvent.DONE, () => {
                doneOperations.push(operation3);
            });
            operation4.on(OperationEvent.DONE, () => {
                doneOperations.push(operation4);
            });
            operation5.on(OperationEvent.DONE, () => {
                doneOperations.push(operation5);
            });

            operationQueue.addOperations([
                operation2,
                operation1,
                operation4,
                operation5,
                operation3
            ]);

            operationQueue.on(QueueEvent.DONE, () => {
                expect(doneOperations[0] === operation1);
                expect(doneOperations[1] === operation2);
                expect(doneOperations[2] === operation3);
                expect(doneOperations[3] === operation4);
                expect(doneOperations[4] === operation5);
                done();
            });
        });
    });

    describe('function completionCallback', () => {
        test('should call completionCallback when operationQueue finished running operations', async (done) => {
            const operationQueue = new OperationQueue();
            operationQueue.maximumConcurrentOperations = 1;
            operationQueue.completionCallback = () => {
                done();
            }
            const operation = new TestOperation();

            operationQueue.addOperation(operation);
        });

        test('should always call completionCallback multiple times when operationQueue finished running operations', async (done) => {
            const operationQueue = new OperationQueue();
            operationQueue.maximumConcurrentOperations = 1;
            const doneFunction = jest.fn(() => {

                if (doneFunction.mock.calls.length === 1) {
                    const operation = new TestOperation();
                    operationQueue.addOperation(operation);
                } else {
                    expect(doneFunction.mock.calls.length).toBe(2);
                    done();
                }
            });
            operationQueue.completionCallback = doneFunction;

            const operation = new TestOperation();
            operationQueue.addOperation(operation);
        });
    })

    describe('function cancel', () => {
        test('can cancel an operation waiting to be executed in queue', async () => {
            const operationQueue = new OperationQueue();
            operationQueue.maximumConcurrentOperations = 1;

            const operation1 = new TimeOutOperation(1000);
            const operation2 = new TestOperation();

            operationQueue.addOperation(operation1);
            operationQueue.addOperation(operation2);
            await nextTick();
            operation2.cancel();
            await nextTick();

            expect(operationQueue.operations.length).toBe(1);
        });

        test('cancel last operation to end queue', async (done) => {
            const operationQueue = new OperationQueue();
            operationQueue.maximumConcurrentOperations = 1;
            const doneFunction = jest.fn(() => {
                done();
            });
            operationQueue.on(QueueEvent.DONE, doneFunction);
            const operation = new TestOperation();

            operationQueue.addOperation(operation);
            operation.cancel();
        });
    });

    describe('function getNextOperation', () => {
        test('should return null if no operations are in queue', () => {
            const operationQueue = new OperationQueue();

            const operation = operationQueue.getNextOperation();

            expect(operation).toBe(null);
        });

        _operationDataProvider()
          .forEach(({operation, result}) => {
            test('should return the next operation', () => {
                const operationQueue = new OperationQueue();
                operationQueue.addOperation(operation);
                operationQueue.queues[operation.queuePriority].push(operation);

                const nextOperation = operationQueue.getNextOperation();

                expect(nextOperation.id).toBe(result.id);
            });
        })
    });
});

function _operationDataProvider() {
    const operation1 = new Operation();
    const operation2 = new Operation();
    const operation3 = new Operation();
    const operation4 = new Operation();
    const operation5 = new Operation();

    operation1.queuePriority = QueuePriority.veryHigh;
    operation2.queuePriority = QueuePriority.high;
    operation3.queuePriority = QueuePriority.normal;
    operation4.queuePriority = QueuePriority.low;
    operation5.queuePriority = QueuePriority.veryLow;

    return [
        {
            operation: operation1,
            result: operation1
        },
        {
            operation: operation2,
            result: operation2
        },
        {
            operation: operation3,
            result: operation3
        },
        {
            operation: operation4,
            result: operation4
        },
        {
            operation: operation5,
            result: operation5
        }
    ]
}
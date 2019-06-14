const { OperationQueue } = require('../OperationQueue');
const { Operation } = require('../Operation');
const { OperationEvent } = require('../OperationEvent');
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

    describe('function on', () => {
    });

    describe('function off', () => {
    });
});
const { OperationQueue } = require('../src/OperationQueue');
const { QueueEvent } = require('../src/QueueEvent');
const { TestOperation, TimeOutOperation } = require('./TestOperation');
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
    
        test('inherits from Operation', () => {
            const operationQueue = new OperationQueue(1);
    
            expect(operationQueue.__proto__.__proto__.constructor.name).toBe('Object');
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
    });

    describe('function start', () => {
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
        })
    });
})
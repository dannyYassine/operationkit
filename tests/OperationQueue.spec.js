const { OperationQueue } = require('../OperationQueue');
const { TestOperation } = require('./TestOperation');

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
        test('should add a single operation to its operations', () => {
            const operationQueue = new OperationQueue(1);
            const operation1 = new TestOperation();

            operationQueue.addOperation(operation1);

            expect(operationQueue.operations).toEqual([operation1]);
        })
    });
  
    describe('function addOperations', () => {
        test('should multiple operations to its operations', () => {
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
        
    });
})
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

    describe('adding operations while queue is still executing', () => {
        
    });
})
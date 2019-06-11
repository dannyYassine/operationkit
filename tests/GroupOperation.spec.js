const { GroupOperation } = require('../GroupOperation');
const { TestOperation } = require('./TestOperation');

describe('GroupOperation', () => {

    describe('function GroupOperation', function () {
        test('should be defined', () => {
            expect(GroupOperation).toBeDefined();
        });
    
        test('should be instantiated', () => {
            const operation = new GroupOperation(1, () => {
                return true;
            });
    
            expect(operation).toBeDefined();
        });
    
        test('inherits from Operation', () => {
            const operation = new GroupOperation(1, () => {
                return true;
            });
    
            expect(operation.__proto__.__proto__.constructor.name).toBe('Operation');
        });
    
        test('should be valid type', () => {
            const operation = new GroupOperation(1, () => {
                return true;
            });
    
            expect(operation.constructor.name).toBe('GroupOperation');
        });
    });

    describe('function start', () => {
        test('groupOperation ends when all of its dependencies are resolved', async () => {
            // const operation1 = new TestOperation(1);
            // const operation2 = new TestOperation(2);
            // const groupOperation = new GroupOperation();

            // groupOperation.addOperations([operation1, operation2]);

            // let copyOperationState1 = null;
            // operation1.completionCallback = op => {
            //     const { isCancelled, isExecuting, isFinished } = groupOperation;
            //     copyOperationState1 = { isCancelled, isExecuting, isFinished };
            // }
            // let copyOperationState2 = null;
            // operation2.completionCallback = op => {
            //     const { isCancelled, isExecuting, isFinished } = groupOperation;
            //     copyOperationState2 = { isCancelled, isExecuting, isFinished };
            // }

            // const promise = groupOperation.start();

            // await promise;
            
            // expect(copyOperationState1.isExecuting).toBe(false);
            // expect(copyOperationState1.isFinished).toBe(false);
            // expect(copyOperationState1.isCancelled).toBe(false);
            
            // expect(copyOperationState2.isExecuting).toBe(false);
            // expect(copyOperationState2.isFinished).toBe(false);
            // expect(copyOperationState2.isCancelled).toBe(false);

            // expect(groupOperation.isExecuting).toBe(true);
            // expect(groupOperation.isFinished).toBe(true);
            // done();
        })
    })
    
})
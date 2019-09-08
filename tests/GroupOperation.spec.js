const { GroupOperation } = require('../src/GroupOperation');
const { TestOperation, TimeOutOperation } = require('./TestOperation');

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
        test('using function addOperations, groupOperation ends when all of its dependencies are resolved', async (done) => {
            const operation1 = new TestOperation(1);
            const operation2 = new TestOperation(2);
            const groupOperation = new GroupOperation();

            groupOperation.addOperations([operation1, operation2]);

            let copyOperationState1 = null;
            operation1.completionCallback = op => {
                const { isCancelled, isExecuting, isFinished } = groupOperation;
                copyOperationState1 = { isCancelled, isExecuting, isFinished };
            }
            let copyOperationState2 = null;
            operation2.completionCallback = op => {
                const { isCancelled, isExecuting, isFinished } = groupOperation;
                copyOperationState2 = { isCancelled, isExecuting, isFinished };
            }

            const promise = groupOperation.start();

            await promise;
            
            expect(copyOperationState1.isExecuting).toBe(true);
            expect(copyOperationState1.isFinished).toBe(false);
            expect(copyOperationState1.isCancelled).toBe(false);
            
            expect(copyOperationState2.isExecuting).toBe(true);
            expect(copyOperationState2.isFinished).toBe(false);
            expect(copyOperationState2.isCancelled).toBe(false);

            expect(groupOperation.isExecuting).toBe(true);
            expect(groupOperation.isFinished).toBe(true);
            done();
        });

        test('using function addOperation, groupOperation ends when all of its dependencies are resolved', async (done) => {
            const operation1 = new TestOperation(1);
            const operation2 = new TestOperation(2);
            const groupOperation = new GroupOperation();

            groupOperation.addOperation(operation1);
            groupOperation.addOperation(operation2);

            let copyOperationState1 = null;
            operation1.completionCallback = op => {
                const { isCancelled, isExecuting, isFinished } = groupOperation;
                copyOperationState1 = { isCancelled, isExecuting, isFinished };
            }
            let copyOperationState2 = null;
            operation2.completionCallback = op => {
                const { isCancelled, isExecuting, isFinished } = groupOperation;
                copyOperationState2 = { isCancelled, isExecuting, isFinished };
            }

            const promise = groupOperation.start();

            await promise;
            
            expect(copyOperationState1.isExecuting).toBe(true);
            expect(copyOperationState1.isFinished).toBe(false);
            expect(copyOperationState1.isCancelled).toBe(false);
            
            expect(copyOperationState2.isExecuting).toBe(true);
            expect(copyOperationState2.isFinished).toBe(false);
            expect(copyOperationState2.isCancelled).toBe(false);

            expect(groupOperation.isExecuting).toBe(true);
            expect(groupOperation.isFinished).toBe(true);
            done();
        });

        test('groupOperation returns array of sorted results of operations', async (done) => {
            const operation1 = new TestOperation(1);
            const operation2 = new TestOperation(2);
            const groupOperation = new GroupOperation();
            
            groupOperation.addOperation(operation2);
            groupOperation.addOperation(operation1);

            const [result2, result1] = await groupOperation.start();

            expect(result1).toBe(operation1.result);
            expect(result2).toBe(operation2.result);

            done();
        });

        test('finishes when all dependent operations are finished asynchronously', async (done) => {
            const operation1 = new TimeOutOperation(1000, 'return1');
            const operation2 = new TimeOutOperation(2000, 'return2');
            const groupOperation = new GroupOperation();
            
            groupOperation.addOperation(operation2);
            groupOperation.addOperation(operation1);

            const [result2, result1] = await groupOperation.start();

            console.log(result1, result2, operation1.result, operation2.result);

            expect(result1).toBe(operation1.resultToReturn);
            expect(result2).toBe(operation2.resultToReturn);

            expect(result1).toBe(operation1.result);
            expect(result2).toBe(operation2.result);

            expect(operation1.result).toBe(operation1.resultToReturn);
            expect(operation2.result).toBe(operation2.resultToReturn);

            done();
        });
    })
    
})
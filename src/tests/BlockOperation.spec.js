const { BlockOperation } = require('../BlockOperation');

describe('BlockOperation', () => {

    describe('function BlockOperation', function () {
        test('should be defined', () => {
            expect(BlockOperation).toBeDefined();
        });
    
        test('should be instantiated', () => {
            const operation = new BlockOperation(1, () => {
                return true;
            });
    
            expect(operation).toBeDefined();
        });
    
        test('inherits from Operation', () => {
            const operation = new BlockOperation(1, () => {
                return true;
            });
    
            expect(operation.__proto__.__proto__.constructor.name).toBe('Operation');
        });
    
        test('should be valid type', () => {
            const operation = new BlockOperation(1, () => {
                return true;
            });
    
            expect(operation.constructor.name).toBe('BlockOperation');
        });
    });

    describe('function constructor', () => {
        test('it should accept an ID if only a number if passed as first argument', () => {
            const operation = new BlockOperation(1);
            expect(operation.id).toBe(1);
        }); 

        test('it should accept the callback if only a function if passed as first argument', () => {
            const runFunction = jest.fn(() => {
                return true;
            });
    
            const operation = new BlockOperation(runFunction);
            operation.start();

            expect(operation.id).toBeDefined();
            expect(runFunction).toHaveBeenCalled();
        }); 

        test('it should accept an ID and the callback as first and second arugments respectively', () => {
            const runFunction = jest.fn(() => {
                return true;
            });
    
            const operation = new BlockOperation(1, runFunction);
            operation.start();

            expect(operation.id).toEqual(1);
            expect(runFunction).toHaveBeenCalled();
        }); 

        test('it should throw error if no parameters are passed in', (done) => {
            try {
                const operation = new BlockOperation();
                fail('should have failed at this point');
            } catch (e) {
                done();
            }
        }); 
    });

    describe('function start', () => {
        test('operation block to be called', () => {
            const runFunction = jest.fn(() => {
                return true;
            });
    
            const operation = new BlockOperation(1, runFunction);
            operation.start();
    
            expect(runFunction).toHaveBeenCalled();
        });
    });

    describe('function addBlock', () => {
        test('should add new function block', () => {
            const operation = new BlockOperation(() => {});

            operation.addBlock(() => {
            });
    
            expect(operation.blocks.length).toEqual(2);
        });

        test('should call new function blocks', async () => {
            const mockBlock1 = jest.fn(() => {});
            const mockBlock2 = jest.fn(() => {});
            const mockBlock3 = jest.fn(() => {});

            const operation = new BlockOperation(mockBlock1);
            operation.addBlock(mockBlock2);
            operation.addBlock(mockBlock3);
    
            await operation.start();

            expect(mockBlock1).toHaveBeenCalled();
            expect(mockBlock2).toHaveBeenCalled();
            expect(mockBlock3).toHaveBeenCalled();
        });

        test('should not add function block if not of function type', () => {
            const operation = new BlockOperation(() => {});

            operation.addBlock('this is not a function');
    
            expect(operation.blocks.length).toEqual(1);
        });
    });

    describe('function run', () => {
        test('pass operation object to function block', async () => {
            const operation = new BlockOperation((op) => {
                expect(op).toEqual(operation);
            });

            await operation.start();
        });
    });
});
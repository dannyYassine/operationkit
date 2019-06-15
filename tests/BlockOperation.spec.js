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
    })
});
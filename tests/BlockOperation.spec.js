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
    })

    test('operation block to be called', () => {
        const runFunction = jest.fn(() => {
            return true;
        });

        const operation = new BlockOperation(1, runFunction);
        operation.start();

        expect(runFunction).toHaveBeenCalled();
    });
});
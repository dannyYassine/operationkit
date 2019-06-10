const { GroupOperation } = require('../GroupOperation');

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
    })
    
})
const { CircularOperationValidator } = require('../CircularOperationValidator');
const { Operation } = require('../Operation');

describe('CircularOperationValidator', function () {
    test('should be defined', () => {
        expect(CircularOperationValidator).toBeDefined();
    });

    test('should throw error when two operations depend on each other', (done) => {
        const operation1 = new Operation();
        const operation2 = new Operation();

        operation1.dependencies = [operation2];
        operation2.dependencies = [operation1];

        try {
            new CircularOperationValidator([operation1]);
            fail('should have failed here');
        } catch (e) {
            expect(e.constructor.name === 'CircularOperationValidatorError').toBe(true);
            done();
        }
    });

    test('should throw error when two deeply nested operations depend on each other', (done) => {
        const operation1 = new Operation();
        const operation2 = new Operation();
        const operation3 = new Operation();
        const operation4 = new Operation();
        const operation5 = new Operation();
        const operation6 = new Operation();
        const operation7 = new Operation();

        operation1.dependencies = [operation2];
        operation2.dependencies = [operation3];
        operation3.dependencies = [operation4];
        operation4.dependencies = [operation5];
        operation5.dependencies = [operation6];
        operation6.dependencies = [operation7];
        operation7.dependencies = [operation1];

        try {
            new CircularOperationValidator([operation1]);
            fail('should have failed here');
        } catch (e) {
            expect(e.constructor.name === 'CircularOperationValidatorError').toBe(true);
            done();
        }
    });

    test('error should be of type ', (done) => {
        const operation1 = new Operation();
        const operation2 = new Operation();

        operation1.dependencies = [operation2];
        operation2.dependencies = [operation1];

        try {
            new CircularOperationValidator([operation1]);
            fail('should have failed here');
        } catch (e) {
            expect(e.constructor.name === 'CircularOperationValidatorError').toBe(true);
            done();
        }
    });

    test('should not throw error when two operations dont depend on each other', (done) => {
        const operation1 = new Operation();
        const operation2 = new Operation();

        operation1.dependencies = [operation2];
        operation2.dependencies = [];

        try {
            new CircularOperationValidator([operation1]);
            done();
        } catch (e) {
            fail('should have failed here');
        }
    });

    test('should throw error when two deeply nested operations depend on each other', (done) => {
        const operation1 = new Operation();
        const operation2 = new Operation();
        const operation3 = new Operation();
        const operation4 = new Operation();
        const operation5 = new Operation();
        const operation6 = new Operation();
        const operation7 = new Operation();

        operation1.dependencies = [operation2];
        operation2.dependencies = [operation3];
        operation3.dependencies = [operation4];
        operation4.dependencies = [operation5];
        operation5.dependencies = [operation6];
        operation6.dependencies = [operation7];
        operation7.dependencies = [];

        try {
            new CircularOperationValidator([operation1]);
            done();
        } catch (e) {
            fail('should have failed here');
        }
    });
});
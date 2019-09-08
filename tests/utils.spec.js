const { copyArray, copyObject, isObjectEmpty } = require('../src/utils');
const { Operation } = require('../src/Operation');
const { TimeOutOperation } = require('./TestOperation');

describe('function copyArray', function () {
    test('copy array of objects', () => {
        const originalArray = [new Operation()];

        expect(copyArray(originalArray)).not.toBe(originalArray);
    });
});

describe('function copyObject', function () {
    test('copy copyObject', () => {
        const orignalObject = new Operation();

        expect(copyObject(orignalObject)).not.toBe(orignalObject);
    });
});

describe('function isObjectEmpty', function () {
    test('return true when empty has no properties', () => {
        const object = {};

        expect(isObjectEmpty(object)).toBe(true);
    });

    test('return false when empty has properties', () => {
        const object = {id: true};

        expect(isObjectEmpty(object)).toBe(false);
    });
});

describe('TimeOutOperation', () => {
    test('should generate a timeout between 0 and 1000 if not passed', () => {
        const operation = new TimeOutOperation();

        expect(operation.time).toBeLessThan(1000);
        expect(operation.time).toBeGreaterThan(0);
    });
})
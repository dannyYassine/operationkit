const { copyArray, copyObject, isObjectEmpty } = require('../src/utils');
const { Operation } = require('../src/Operation');

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

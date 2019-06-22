const { copyArray, copyObject } = require('../src/utils');
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

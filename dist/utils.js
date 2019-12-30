"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyArray = (array) => {
    return array.map(object => Object.assign(Object.create(object), object));
};
exports.copyObject = (object) => {
    return Object.assign(Object.create(object), object);
};
exports.isObjectEmpty = (object) => {
    for (const key in object) {
        return false;
    }
    return true;
};
//# sourceMappingURL=utils.js.map
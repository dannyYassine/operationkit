
const copyArray = array => {
    return array.map(object => Object.assign(Object.create(object), object))
};

const copyObject = object => {
    return Object.assign(Object.create(object), object);
};

const isObjectEmpty = object => {
    for (const key in object) {
        return false;
    }
    return true;
};

module.exports = {
    copyArray,
    copyObject,
    isObjectEmpty
};
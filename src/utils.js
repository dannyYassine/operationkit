const copyArray = array => {
    return array.map(object => Object.assign(Object.create(object), object))
}

const copyObject = object => {
    return Object.assign(Object.create(object), object);
}


module.exports = {
    copyArray,
    copyObject
}
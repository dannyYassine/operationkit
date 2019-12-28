
export const copyArray: (array: any[]) => any[] = (array: any[]) => {
    return array.map(object => Object.assign(Object.create(object), object))
};

export const copyObject: (objet: Object) => Object = (object: Object) => {
    return Object.assign(Object.create(object), object);
};

export const isObjectEmpty: (object: Object) => boolean = (object: Object) => {
    for (const key in object) {
        return false;
    }
    return true;
};
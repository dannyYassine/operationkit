const delay = (time) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}

const nextTick = () => {
    return new Promise((resolve, reject) => {
        process.nextTick(() => {
            resolve();
        });
    })
}

module.exports = {
    delay,
    nextTick
}
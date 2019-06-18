const QueuePriority = {
    veryLow: 0,
    low: 1,
    normal: 2,
    high: 3,
    veryHigh: 4,
    isValid(value) {
        return value >= QueuePriority.veryLow && value <= QueuePriority.veryHigh;
    }
}

module.exports = {
    QueuePriority
}
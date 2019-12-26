
/**
 * Priority given to an operation when it is executed inside an OperationQueue.
 */
class QueuePriority {

    /**
     * Lowest priority
     * @type {number}
     */
    get veryLow() {
        return 0;
    }

    /**
     * Low priority
     * @type {number}
     */
    get low() {
        return 1;
    }

    /**
     * Normal priority
     * @type {number}
     */
    get normal() {
        return 2;
    }

    /**
     * High priority
     * @type {number}
     */
    get high() {
        return 3;
    }

    /**
     * Highest priority
     * @type {number}
     */
    get veryHigh() {
        return 4;
    }

    /**
     * Validates QueuePriority assignment value
     * @param {QueuePriority|number} value
     */
    isValid(value) {
        return value >= this.veryLow && value <= this.veryHigh;
    }
}

module.exports = {
    QueuePriority: new QueuePriority()
};
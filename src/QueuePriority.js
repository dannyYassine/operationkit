
/**
 * Priority given to an operation when it is executed inside an OperationQueue.
 */
class QueuePriority {

    /**
     * Lowest priority
     */
    get veryLow() {
        return 0;
    }

    /**
     * Low priority
     */
    get low() {
        return 1;
    }

    /**
     * Normal priority
     */
    get normal() {
        return 2;
    }

    /**
     * High priority
     */
    get high() {
        return 3;
    }

    /**
     * Highest priority
     */
    get veryHigh() {
        return 4;
    }

    /**
     * Validates QueuePriority assignment value
     * @param {number} value 
     */
    isValid(value) {
        return value >= this.veryLow && value <= this.veryHigh;
    }
}

module.exports = {
    QueuePriority: new QueuePriority()
}
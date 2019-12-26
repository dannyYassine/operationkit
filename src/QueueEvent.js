
/**
 * Events fired from OperationQueue
 */
class QueueEvent {

    /**
     * DONE Event
     * @returns {string}
     */
    get DONE() {
        return 'done';
    }

    /**
     * PAUSED Event
     * @returns {string}
     */
    get PAUSED() {
        return 'paused';
    }

    /**
     * RESUMED Event
     * @returns {string}
     */
    get RESUMED() {
        return 'resumed';
    }
}

module.exports = {
    QueueEvent: new QueueEvent()
};
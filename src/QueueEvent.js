
/**
 * Events fired from OperationQueue
 */
class QueueEvent {

    /**
     * DONE Event
     */
    get DONE() {
        return 'done';
    }

    /**
     * PAUSED Event
     */
    get PAUSED() {
        return 'paused';
    }

    /**
     * RESUMED Event
     */
    get RESUMED() {
        return 'resumed';
    }
}

module.exports = {
    QueueEvent: new QueueEvent()
}
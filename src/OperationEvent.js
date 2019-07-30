
/**
 * Events fired from Operation
 */
class OperationEvent {

    /**
     * Event when operation starts
     */
    get START() {
        return 'start';
    }

    /**
     * Event when operation is ready to be executed
     */
    get READY() {
        return 'ready';
    }

    /**
     * Event when operation is done
     */
    get DONE() {
        return 'done';
    }

    /**
     * Event when operation is cancelled
     */
    get CANCEL() {
        return 'cancel';
    }

    /**
     * Event when something went wrong
     */
    get ERROR() {
        return 'e';
    }
}

module.exports = {
    OperationEvent: new OperationEvent()
};
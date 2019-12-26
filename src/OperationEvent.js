
/**
 * Events fired from Operation
 */
class OperationEvent {

    /**
     * Event when operation starts
     * @returns {string}
     */
    get START() {
        return 'start';
    }

    /**
     * Event when operation is ready to be executed
     * @returns {string}
     */
    get READY() {
        return 'ready';
    }

    /**
     * Event when operation is done
     * @returns {string}
     */
    get DONE() {
        return 'done';
    }

    /**
     * Event when operation is cancelled
     * @returns {string}
     */
    get CANCEL() {
        return 'cancel';
    }

    /**
     * Event when something went wrong
     * @returns {string}
     */
    get ERROR() {
        return 'e';
    }
}

module.exports = {
    OperationEvent: new OperationEvent()
};
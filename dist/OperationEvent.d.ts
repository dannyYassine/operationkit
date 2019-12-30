/**
 * Events fired from Operation
 */
export declare enum OperationEvent {
    /**
     * Event when operation starts
     */
    START = "start",
    /**
     * Event when operation is ready to be executed
     */
    READY = "ready",
    /**
     * Event when operation is done
     */
    DONE = "done",
    /**
     * Event when operation is cancelled
     */
    CANCEL = "cancel",
    /**
     * Event when something went wrong
     */
    ERROR = "error"
}

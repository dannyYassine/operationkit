"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Events fired from Operation
 */
var OperationEvent;
(function (OperationEvent) {
    /**
     * Event when operation starts
     */
    OperationEvent["START"] = "start";
    /**
     * Event when operation is ready to be executed
     */
    OperationEvent["READY"] = "ready";
    /**
     * Event when operation is done
     */
    OperationEvent["DONE"] = "done";
    /**
     * Event when operation is cancelled
     */
    OperationEvent["CANCEL"] = "cancel";
    /**
     * Event when something went wrong
     */
    OperationEvent["ERROR"] = "error";
})(OperationEvent = exports.OperationEvent || (exports.OperationEvent = {}));
//# sourceMappingURL=OperationEvent.js.map
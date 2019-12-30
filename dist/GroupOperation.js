"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Operation_1 = require("./Operation");
const OperationQueue_1 = require("./OperationQueue");
/**
 * @class GroupOperation
 */
class GroupOperation extends Operation_1.Operation {
    constructor() {
        super();
        this.queue = new OperationQueue_1.OperationQueue();
        this.operations = [];
    }
    /**
     * @override
     *
     * @returns {Promise}
     */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.queue.addOperations(this.operations);
            const accum = [];
            return this.operations.reduce((accum, operation) => {
                accum.push(operation.result);
                return accum;
            }, accum);
        });
    }
    /**
     * @override
     */
    start() {
        const _super = Object.create(null, {
            start: { get: () => super.start }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.dependencies = [];
            return _super.start.call(this);
        });
    }
    /**
     * @param {Operation} operation
     */
    addOperation(operation) {
        this.operations.push(operation);
        this.dependencies = [];
    }
    /**
     * @param {Array.<Operation>} operations
     */
    addOperations(operations) {
        this.operations = this.operations.concat(operations);
        this.dependencies = [];
    }
}
exports.GroupOperation = GroupOperation;
//# sourceMappingURL=GroupOperation.js.map
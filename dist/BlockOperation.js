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
/**
 * Operation Subclass that accepts a function as an argument which will be the task to run.
 * Additionally, multiple functions can be appended to run simultaneously as the same task.
 */
class BlockOperation extends Operation_1.Operation {
    constructor() {
        let id;
        let block;
        const first = arguments[0];
        if (typeof first === 'number') {
            id = first;
            const second = arguments[1];
            if (typeof second === 'function') {
                block = second;
            }
        }
        else if (typeof first === 'function') {
            block = first;
        }
        else {
            throw new Error('Wrong arguments passed: missing ID and/or function');
        }
        super(id);
        this.blocks = [block];
    }
    /**
     *
     */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const promises = [];
            this.blocks.forEach(block => {
                promises.push(block(this));
            });
            const results = yield Promise.all(promises);
            return results.length === 1
                ? results[0]
                : results;
        });
    }
    /**
     * Append another function to run simultaneously as the same task
     * @param {function} block - function to add
     */
    addBlock(block) {
        this.blocks.push(block);
    }
}
exports.BlockOperation = BlockOperation;
//# sourceMappingURL=BlockOperation.js.map
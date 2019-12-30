import { Operation } from './Operation';
declare type BlockResult = any[] | any;
/**
 * Operation Subclass that accepts a function as an argument which will be the task to run.
 * Additionally, multiple functions can be appended to run simultaneously as the same task.
 */
export declare class BlockOperation extends Operation<any> {
    blocks: Function[];
    constructor();
    /**
     *
     */
    run(): Promise<BlockResult>;
    /**
     * Append another function to run simultaneously as the same task
     * @param {function} block - function to add
     */
    addBlock(block: Function): void;
}
export {};

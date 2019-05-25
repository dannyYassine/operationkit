const EventEmitter = require('events')
const uuidv4 = require('uuid/v4');

const { OperationEvent } = require('./OperationEvent');

class Operation {

    constructor(id) {
        this.id = id || uuidv4();
        this.ee = new EventEmitter();
        this.dependencies = [];
        this.completionCallback = null;
        this.map = {};
        this.isExecuting = false;
        this._done = false;
        this._canStart = false;
    }

    done() {
        console.log(`done: ${this.id}`);
        this._done = true;
        this.ee.emit(OperationEvent.DONE, this);
        this.completionCallback && this.completionCallback();
    }

    isDone() {
        return this._done;
    }
    
    cancel() {
        this._cancelled = true;
        this.ee.emit(OperationEvent.CANCEL, this);
    }

    isCancelled() {
        return this._cancelled;
    }

    on(event, cb) {
        this.ee.on(event, cb);
    }

    off(event, cb) {
        this.ee.off(event, cb);
    }

    async run() {
        console.error('must be implemented');
        return new Promise();
    }

    async start() {
        if (this.isExecuting) {
            return;
        }
        
        if (!this._canStart) {
            try {
                this._createMap();
            } catch (e) {
                return;
            }
        }
        
        console.log(`start: ${this.id}`);
        this.isExecuting = true;
        this.ee.emit(OperationEvent.START, this);
        this.run()
            .then(result => {
                this.result = result;
                this.done();
            })
            .catch(e => {
                this.isExecuting = false;
                this.ee.emit(OperationEvent.ERROR, {err:e, operation: this});
            });
    }

    _createMap() {
        if (!this.dependencies.length) {
            this._canStart = true;
            return;
        }

        this.dependencies.forEach(operation => {
            if (operation.id === this.id) {
                console.warn('Operation has itself in it\'s own dependencies');
                this._canStart = true;
                operation.on(OperationEvent.DONE, this._onDependantOperationDone.bind(this));
                operation.start();
                return;
            } 

            this.map[operation.id] = true;
            operation.on(OperationEvent.DONE, this._onDependantOperationDone.bind(this));
            operation.start();
        });

        throw new Error();
    }

    _onDependantOperationDone(operation) {
        delete this.map[operation.id];
        this._tryStart();
    }

    _tryStart() {
        if (this._isEmpty(this.map)) {
            this._canStart = true;
            this.start();
        }
    }

    _isEmpty(obj) {
        for(var key in obj) {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
}

module.exports = {
    Operation
}
<template>
    <div>
        <button @click="onAddClicked()">Add</button>
        <div>Operation 1</div>
        <div>Is executing: {{groupOperation.isExecuting ? true : false}}</div>
        <div>Is finished: {{groupOperation.isFinished ? true : false}}</div>

        <div>Operation 2</div>
        <div>Is executing: {{groupOperation2.isExecuting ? true : false}}</div>
        <div>Is finished: {{groupOperation2.isFinished ? true : false}}</div>

        <div>Operation 3</div>
        <div>Is executing: {{groupOperation3.isExecuting ? true : false}}</div>
        <div>Is finished: {{groupOperation3.isFinished ? true : false}}</div>

        <div>Operation Queue</div>
        <div>Is executing: {{queue.isExecuting ? true : false}}</div>
    </div>
</template>
<script>
import { Operation, BlockOperation, OperationQueue, QueuePriority } from 'operationkit';

export default {
  name: 'operation',
  data() {
      return {
          queue: new OperationQueue(),
          groupOperation: null,
          groupOperation2: null,
          groupOperation3: null
      }
  },
  created() {
      this.queue.maximumConcurentOperations = 1;

      this.groupOperation = new BlockOperation(1, () => {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                console.log('hello');
                resolve();
              }, 1000);
          })
      });
      this.groupOperation.queuePriority = QueuePriority.veryHigh;

      this.groupOperation2 = new BlockOperation(2, () => {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                console.log('world');
                resolve();
              }, 500);
          })
      });
      this.groupOperation.queuePriority = QueuePriority.high;

      this.groupOperation3 = new BlockOperation(3, () => {
            return new Promise((resolve, reject) => {
              setTimeout(() => {
                console.log('!!!');
                resolve();
              }, 1000);
          });
});
      this.groupOperation3.queuePriority = QueuePriority.low;

      this.queue.addOperations([this.groupOperation, this.groupOperation2])
      .then(() => {
          console.log('done');
      });
      this.queue.completionCallback = () => {
          console.log('done');
      }

      setTimeout(() => {
          this.queue.addOperation(this.groupOperation3);
      }, 1000);
  },
  methods: {
      onAddClicked() {
        const operation = new BlockOperation(1, () => {
          return new Promise((resolve, reject) => {
              setTimeout(() => {
                console.log('hello');
                resolve();
              }, 1000);
          })
                    this.queue.addOperation(operation);
      });
      }
  }
}
</script>
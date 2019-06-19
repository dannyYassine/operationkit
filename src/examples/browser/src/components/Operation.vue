<template>

</template>
<script>
import { Operation, BlockOperation, OperationQueue, QueuePriority } from 'operationkit';

export default {
  name: 'operation',
  data() {
      return {
          queue: new OperationQueue()
      }
  },
  created() {
      const groupOperation = new BlockOperation(async () => {
          console.log('hello');
      });
      groupOperation.queuePriority = QueuePriority.veryHigh;

      const groupOperation2 = new BlockOperation(async () => {
          console.log('world');
      });
      groupOperation.queuePriority = QueuePriority.low;

      this.queue.addOperations([groupOperation, groupOperation2]);
  }
}
</script>
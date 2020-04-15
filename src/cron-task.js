const cron = require('node-cron');
const sleep = require('sleep-promise');

const TaskQueue = require('./task-queue');
const { DBSyncInfo, DBSyncStatus } = require('./dbsync-info');

class Cron {
    constructor() {
        this.task = null;
        this.queue = new TaskQueue();

        this.cronExp = '*/1 * * * * *';
    }

    // Process
    init(data) {
        this.task = cron.schedule(this.cronExp, (data) => {
            this.stop();

            return this.do(data)
                .finally(() => this.start());
        }, {
            scheduled: false,
        });
    }

    start() {
        this.task.start();
    }

    stop() {
        this.task.stop();
    }

    destroy() {
        this.task.destroy();
    }

    async do(data) {
        console.time('task');

        // get queue size
        const queueSize = this.queue.getLength();

        // get from queue head
        const headItem = this.queue.getFromHead();
        if (!headItem) {
            console.log('[TASK] Queue size: 0');
            console.timeEnd('task');
            return;
        }

        // check the head item's status
        if (headItem.getStatus() === DBSyncStatus.CANCELED) {
            console.log(`[TASK] Queue[0]/${queueSize} == CANCELED ; delete it`);
            this.queue.getAndDeleteFromHead();
            console.timeEnd('task');
            return;
        }

        if (headItem.getStatus() === DBSyncStatus.RUNNING) {
            console.log(`[TASK] Queue[0]/${queueSize} == RUNNING ; pass it`);
            console.timeEnd('task');
            return;
        }

        // set it RUNNING
        headItem.setRunning();

        // do the process
        console.log(`[TASK] Queue[0]/${queueSize} : `, headItem);

        console.log(`[TASK] Queue[0]/${queueSize} : (1) Job 1 - 3 sec...`);
        await sleep(3000);
        console.log(`[TASK] Queue[0]/${queueSize} : (1) Job 1 - 3 sec... End`);

        // check CANCELED
        if (headItem.getStatus() === DBSyncStatus.CANCELED) {
            console.log(`[TASK] Queue[0]/${queueSize} : Canceled`);
            this.queue.getAndDeleteFromHead();
            console.timeEnd('task');
            return;
        }

        console.log(`[TASK] Queue[0]/${queueSize} : (2) Job 2 - 2 sec...`);
        await sleep(2000);
        console.log(`[TASK] Queue[0]/${queueSize} : (2) Job 2 - 2 sec... End`);

        console.log(`[TASK] Queue[0]/${queueSize} : ... End`)

        // remove from queue
        this.queue.getAndDeleteFromHead();

        console.timeEnd('task');
        return;
    }

    // Queue
    // Always with nodeId, nodeNumber, tenantNumber
    async addDBSyncTaskToQueue(pbxId, nodeNumber, tenantNumber) {
        const syncInfo = new DBSyncInfo({pbxId, nodeNumber, tenantNumber});

        if (this.queue.findByPbxNodeTenant(syncInfo)) {
            throw new Error('There is the same task in the queue.');
        }

        syncInfo.setPending();
        const queueLen = this.queue.addToTail(syncInfo);
        if (!queueLen) {
            throw new Error('Cannot add this task in the queue any more.');
        }
    }

    cancelDBSyncTask(pbxId, nodeNumber, tenantNumber) {
        const syncInfo = new DBSyncInfo({pbxId, nodeNumber, tenantNumber});

        const found = this.queue.findByPbxNodeTenant(syncInfo);
        if (found) {
            found.setCanceled();
            return Promise.resolve();
        }

        return Promise.reject();
    }
}

module.exports = Cron;

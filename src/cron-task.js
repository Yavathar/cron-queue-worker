const cron = require('node-cron');
const sleep = require('sleep-promise');

class Cron {
    constructor() {
        this.task = null;
        this.queue = new CronQueue();

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

        // get from queue head
        const headItem = this.queue.getFromHead();
        if (!headItem) {
            console.log('[TASK] Nothing in the queue');
            console.timeEnd('task');
            return;
        }

        // do with the head item
        if (headItem.getStatus() !== DBSyncStatus.PENDING) {
            console.log('[TASK] Not pending');
            console.timeEnd('task');
            return;
        }

        console.log('[TASK] This item is ', headItem);

        // let total = 0;
        // for (let index = 0; index < 1000000000; index++) {
        //     total = total + index;
        //     if (headItem.getStatus() === DBSyncStatus.CANCELLED) {
        //         console.log('(1) This item was cancelled at', index, total);
        //         this.queue.getAndDeleteFromHead();
        //         return resolve();
        //     }
        // }

        console.log('[TASK] 3 sec job...');
        await sleep(3000);

        console.log('[TASK] (1) End of calculation');

        if (headItem.getStatus() === DBSyncStatus.CANCELLED) {
            console.log('[TASK] (1) This item was cancelled');
            this.queue.getAndDeleteFromHead();
            console.timeEnd('task');
            return;
        }

        // for (let index = 0; index < 1000000000; index++) {
        //     total = total + index;
        //     if (headItem.getStatus() === DBSyncStatus.CANCELLED) {
        //         console.log('(2) This item was cancelled at', index, total);
        //         this.queue.getAndDeleteFromHead();
        //         return resolve();
        //     }
        // }

        console.log('[TASK] 3 sec job...');
        await sleep(3000);

        console.log('[TASK] (2) End of calculation');

        if (headItem.getStatus() === DBSyncStatus.CANCELLED) {
            console.log('[TASK] (2) This item was cancelled');
            this.queue.getAndDeleteFromHead();
            console.timeEnd('task');
            return;
        }

        // remove from queue
        this.queue.getAndDeleteFromHead();

        console.log('[TASK] End of func')

        console.timeEnd('task');
        return;
    }

    // Queue
    // Always with nodeId, nodeNumber, tenantNumber
    addDBSyncTaskToQueue(pbxId, nodeNumber, tenantNumber) {
        const syncInfo = new DBSyncInfo({pbxId, nodeNumber, tenantNumber});

        if (this.queue.findByPbxNodeTenant(syncInfo)) {
            return Promise.reject();
        }

        syncInfo.setPending();
        this.queue.addToTail(syncInfo);

        return Promise.resolve();
    }

    cancelDBSyncTask(pbxId, nodeNumber, tenantNumber) {
        const syncInfo = new DBSyncInfo({pbxId, nodeNumber, tenantNumber});

        const found = this.queue.findByPbxNodeTenant(syncInfo);
        if (found) {
            console.log(`Found pbxId(${pbxId}), node(${nodeNumber}), tenant(${tenantNumber})`);
            found.setCancelled();
            return Promise.resolve();
        }

        return Promise.reject();
    }
}

class DBSyncInfo {
    constructor(info) {
        this.id = info.id;
        this.pbxId = info.pbxId;
        this.nodeNumber = info.nodeNumber || 'all';
        this.tenantNumber = info.tenantNumber || 'all';
        this.pbxInfo = info.pbxInfo;
        this.status = DBSyncStatus.PENDING;
    }

    setPending() {
        this.status = DBSyncStatus.PENDING;
    }

    setRunning() {
        this.status = DBSyncStatus.RUNNING;
    }

    setCancelled() {
        this.status = DBSyncStatus.CANCELLED;
    }

    getStatus() {
        return this.status;
    }
}

class DBSyncStatus {
    static PENDING = 'PENDING';
    static RUNNING = 'RUNNING';
    static CANCELLED = 'CANCELLED';
}

class CronQueue {
    // Based on Array
    constructor() {
        this.list = [];
    }

    addToTail(syncInfo) {
        this.list.push(syncInfo);
    }

    getFromHead() {
        if (this.list.length > 0) {
            return this.list[0];
        }
        return undefined;
    }

    getAndDeleteFromHead() {
        return this.list.shift();
    }

    getLength() {
        return this.list.length;
    }

    find(id) {
        return this.list.find((item) => item.id === id);
    }

    // obj specific
    findByPbxNodeTenant(syncInfo) {
        return this.list.find((item) => syncInfo.pbxId === item.pbxId
            && syncInfo.nodeNumber.toString() === item.nodeNumber.toString()
            && syncInfo.tenantNumber.toString() === item.tenantNumber.toString()
        );
    }
}

module.exports = Cron;

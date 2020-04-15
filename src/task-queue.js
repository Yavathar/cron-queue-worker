class CronQueue {
    // Based on Array
    constructor() {
        this.list = [];
        this.maxQueueSize = 10;
    }

    addToTail(syncInfo) {
        if (this.list.length < this.maxQueueSize) {
            return this.list.push(syncInfo);
        }
        return undefined;
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

module.exports = CronQueue;

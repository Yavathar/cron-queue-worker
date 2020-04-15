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

    setCanceled() {
        this.status = DBSyncStatus.CANCELED;
    }

    getStatus() {
        return this.status;
    }
}

class DBSyncStatus {
    static PENDING = 'PENDING';
    static RUNNING = 'RUNNING';
    static CANCELED = 'CANCELED';
}

module.exports = { DBSyncInfo, DBSyncStatus };

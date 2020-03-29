const CronTask = require('./src/cron-task');

myCron = new CronTask();

function main() {
    console.time('main');
    myCron.init();
    myCron.start();

    return new Promise((resolve) => {
        const sec = 30;
        console.log(`You have ${sec} seconds`);

        setTimeout(() => {
            console.log('QUEUE: Add 1, 2, 3');
            return myCron.addDBSyncTaskToQueue(1, 2, 3)
                .then(() => console.log('QUEUE: Succeeded to add 1, 2, 3'))
                .catch((err) => console.log('QUEUE: Failed to add 1, 2, 3', err.message));
        }, 3 * 1000);

        setTimeout(() => {
            console.log('QUEUE: Add 1, 2, 4');
            return myCron.addDBSyncTaskToQueue(1, 2, 4)
                .then(() => console.log('QUEUE: Succeeded to add 1, 2, 4'))
                .catch((err) => console.log('QUEUE: Failed to add 1, 2, 4', err.message));
        }, 3 * 1000);

        setTimeout(() => {
            console.log('QUEUE: Add 1, 2, 5');
            return myCron.addDBSyncTaskToQueue(1, 2, 5)
                .then(() => console.log('QUEUE: Succeeded to add 1, 2, 5'))
                .catch((err) => console.log('QUEUE: Failed to add 1, 2, 5', err.message));
        }, 3 * 1000);

        setTimeout(() => {
            console.log('QUEUE: Add 1, 2, 6');
            return myCron.addDBSyncTaskToQueue(1, 2, 6)
                .then(() => console.log('QUEUE: Succeeded to add 1, 2, 6'))
                .catch((err) => console.log('QUEUE: Failed to add 1, 2, 6', err.message));
        }, 3 * 1000);

        setTimeout(() => {
            console.log('QUEUE: Add 1, 2, 5 again');
            return myCron.addDBSyncTaskToQueue(1, 2, 5)
                .then(() => console.log('QUEUE: Succeeded to add 1, 2, 5 again'))
                .catch((err) => console.log('QUEUE: Failed to add 1, 2, 5 again', err.message));
        }, 4 * 1000);

        setTimeout(() => {
            console.log('QUEUE: Cancel 1, 2, 3');
            return myCron.cancelDBSyncTask(1, 2, 3)
                .then(() => console.log('QUEUE: Succeeded to cancel 1, 2, 3'))
                .catch((err) => console.log('QUEUE: Failed to cancel 1, 2, 3', err.message));
        }, 5 * 1000);

        setTimeout(() => {
            console.log('QUEUE: Cancel 1, 2, 4');
            return myCron.cancelDBSyncTask(1, 2, 4)
                .then(() => console.log('QUEUE: Succeeded to cancel 1, 2, 4'))
                .catch((err) => console.log('QUEUE: Failed to cancel 1, 2, 4', err.message));
        }, 5 * 1000);

        setTimeout(() => {
            // myCron.stop(); // .stop() will not stop it.
            myCron.destroy(); // But, remaining task will continue to be running
            resolve();
        }, sec * 1000);
    })
        .finally(() => console.timeEnd('main'));
}

main();

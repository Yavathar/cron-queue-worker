const CronTask = require('./src/cron-task');

myCron = new CronTask();

function main() {
    console.time('main');
    myCron.init();
    myCron.start();

    return new Promise((resolve) => {
        const sec = 10;
        console.log(`You have ${sec} seconds`);

        setTimeout(() => {
            console.log('QUEUE: Add 1, 2, 3');
            return myCron.addDBSyncTaskToQueue(1, 2, 3)
                .then(() => console.log('QUEUE: Succeeded to add 1, 2, 3'))
                .catch(() => console.log('QUEUE: Failed to add 1, 2, 3'));
        }, 3 * 1000);

        setTimeout(() => {
            console.log('QUEUE: Add 1, 2, 4');
            return myCron.addDBSyncTaskToQueue(1, 2, 4)
                .then(() => console.log('QUEUE: Succeeded to add 1, 2, 4'))
                .catch(() => console.log('QUEUE: Failed to add 1, 2, 4'));
        }, 4 * 1000);

        setTimeout(() => {
            console.log('QUEUE: Cancel 1, 2, 3');
            return myCron.cancelDBSyncTask(1, 2, 3)
                .then(() => console.log('QUEUE: Succeeded to cancel 1, 2, 3'))
                .catch(() => console.log('QUEUE: Failed to cancel 1, 2, 3'));
        }, 5 * 1000);

        setTimeout(() => {
            // myCron.stop(); // .stop() will not stop it.
            myCron.destroy();
            resolve();
        }, sec * 1000);
    })
        .finally(() => console.timeEnd('main'));
}

main();

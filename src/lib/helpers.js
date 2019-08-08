const axios = require('axios');
const fs = require('fs');
const path = require('path');

const { SendToQueue } = require('./queue');

const url = "https://cwi-nodejs-test.herokuapp.com";

async function CreateUsers(channel, consumeQueue) {
    console.log('Creating users');
    channel.prefetch(1);
    const usersArray = [];

    channel.consume(consumeQueue, async function (msg) {

        usersArray.push(JSON.parse(msg.content.toString()));

        const queue = await channel.assertQueue(consumeQueue, { durable: false });

        if (queue.messageCount === 0) {
            console.log('Users json file created');
            fs.writeFileSync('users.json', JSON.stringify(usersArray, null, 4));
            process.exit(0);
        }
    }, { noAck: true });
}


/**
 * @author Vitor Ferreira Garcia <vitfgarcia@gmail.com>
 * @description Function to init queue params and wrap
 *              ProcessAddress
 * @param {Channel} channel - channel object from amqplib
 * @param {String} successQueue - queue to receive payload in case of success
 * @param {String} errorQueue  - queue to receive payload in case of error
 */
const Queue = (channel, originQueue, successQueue, errorQueue) => ({
    creating: false,

    /**
     * @author Vitor Ferreira Garcia <vitfgarcia@gmail.com>
     * @description Function that receives a user as a message from queue
     *              and populates the user with address
     * @param {ConsumeMessage} msg 
     */
    ProcessAddress: async function (msg) {
        const context = {
            user: JSON.parse(msg.content.toString()),
            queue: '',
        };

        try {
            const response = await axios.get(`${url}/${context.user.id}/address`);
            context.user.address = response.data;
            context.queue = successQueue;
        } catch (err) {
            if (err && err.response && err.response.status === 404) {
                context.user.address = {};
                context.queue = successQueue;
            } else {
                context.queue = errorQueue;
            }
        } finally {
            await SendToQueue(channel, context.queue, Buffer.from(JSON.stringify(context.user)));
            channel.ack(msg);

            const origin = await channel.assertQueue(originQueue, { durable: false });
            if (origin.messageCount === 0 && !this.creating) {
                this.creating = true;
                setTimeout(async () => {
                    await CreateUsers(channel, successQueue);
                }, 10000)
            }
        }
    },
});

module.exports = {
    Queue,
};

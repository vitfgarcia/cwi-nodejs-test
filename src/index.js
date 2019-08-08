const JSONStream = require('JSONStream');
const es = require('event-stream');

const { MakeRequest } = require('./lib/request');
const { SendToQueue } = require('./lib/queue');
const { Queue } = require('./lib/helpers');

const usersQueue = 'users-queue';
const finalQueue = 'final-queue';

const url = "https://cwi-nodejs-test.herokuapp.com";

(async () => {
    const conn = await require('amqplib').connect("amqp://localhost");
    const channel = await conn.createChannel();

    const response = await MakeRequest(url);

    response.data
        .pipe(JSONStream.parse('*'))
        .pipe(es.mapSync(function (data) {
            SendToQueue(channel, usersQueue, Buffer.from(JSON.stringify(data)));
        }))

    channel.prefetch(50);
    await channel.assertQueue(usersQueue, { durable: false });

    const ProcessAddress = Queue(channel, usersQueue, finalQueue, usersQueue).ProcessAddress;
    channel.consume(usersQueue, ProcessAddress, { noAck: false });
})()
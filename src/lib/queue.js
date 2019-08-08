/**
 * @author Vitor Ferreira Garcia <vitfgarcia@gmail.com>
 * @description Function that receives a queue name and data
 *              and add the data to the queue
 * 
 * @param {Channel} channel - channel object from amqplib
 * @param {String} queueName - name of the queue
 * @param {Buffer} data  - data in the form of buffer
 */
async function SendToQueue(channel, queueName, data) {
    try {
        const ok = await channel.assertQueue(queueName, { durable: false });
        
        if (ok) {
            await channel.sendToQueue(queueName, data);
        }
    } catch (err) {
        console.error(`Unable to send data to queue: ${queueName}`);
    }
}

module.exports = {
    SendToQueue
};

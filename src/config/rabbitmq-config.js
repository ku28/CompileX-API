import amqp from "amqplib";
import EventEmitter from "events";
import dotenv from "dotenv";
dotenv.config();

const eventEmitter = new EventEmitter();
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";
const RABBITMQ_QUEUE = process.env.RABBITMQ_QUEUE || "task_queue";
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

let connection = null;
let channel = null;

async function connectWithRetry(retries = MAX_RETRIES) {
  try {
    connection = await amqp.connect(RABBITMQ_URL, {
      heartbeat: 60,
      connectionTimeout: 10000
    });

    connection.on('error', (error) => {
      console.error('RabbitMQ connection error:', error);
      if (retries > 0) {
        console.log(`Retrying connection... (${retries} attempts left)`);
        setTimeout(() => connectWithRetry(retries - 1), RETRY_DELAY);
      }
    });

    connection.on('close', () => {
      console.log('RabbitMQ connection closed, attempting to reconnect...');
      if (retries > 0) {
        setTimeout(() => connectWithRetry(retries - 1), RETRY_DELAY);
      }
    });

    channel = await connection.createChannel();
    await channel.assertQueue(RABBITMQ_QUEUE, {
      durable: true // Enable message persistence
    });

    console.log(`Connected to RabbitMQ and queue ${RABBITMQ_QUEUE} is ready`);

    eventEmitter.on("message_received", (data) => {
      try {
        channel.sendToQueue(RABBITMQ_QUEUE, Buffer.from(JSON.stringify(data)), {
          persistent: true
        });
        console.log('Message sent to queue:', RABBITMQ_QUEUE);
      } catch (err) {
        console.error('Error sending message:', err);
      }
    });
  } catch (error) {
    console.error("Failed to connect to RabbitMQ", error);
    if (retries > 0) {
      console.log(`Retrying connection... (${retries} attempts left)`);
      setTimeout(() => connectWithRetry(retries - 1), RETRY_DELAY);
    }
  }
}

process.on('SIGINT', () => {
  eventEmitter.removeAllListeners();
  if (connection) {
    connection.close();
  }
  process.exit();
});

export { connectWithRetry as rabbitmqConnect, eventEmitter };
import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (error) => {
      console.error(`Redis client error: ${error.message}`);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async waitForConnection() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.client.connected) {
          clearInterval(interval);
          resolve();
        }
      }, 100); // Check every 100ms
    });
  }

  async get(key) {
    await this.waitForConnection();
    const getAsync = promisify(this.client.get).bind(this.client);
    const value = await getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    await this.waitForConnection();
    const setAsync = promisify(this.client.set).bind(this.client);
    await setAsync(key, value, 'EX', duration);
  }

  async del(key) {
    await this.waitForConnection();
    const delAsync = promisify(this.client.del).bind(this.client);
    await delAsync(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;


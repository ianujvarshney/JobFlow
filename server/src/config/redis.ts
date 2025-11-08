import { createClient } from 'redis';

const createRedisClient = () => {
  const redisConfig = {
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    password: process.env.REDIS_PASSWORD || undefined,
    retry_strategy: (times: number) => Math.min(times * 50, 2000),
  };

  const client = createClient(redisConfig);

  client.on('error', (err: any) => {
    console.error('Redis Client Error:', err);
  });

  client.on('connect', () => {
    console.log('Redis Client Connected');
  });

  client.on('ready', () => {
    console.log('Redis Client Ready');
  });

  return client;
};

export default createRedisClient;
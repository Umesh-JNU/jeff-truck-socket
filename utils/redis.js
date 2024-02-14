const { createClient } = require("redis");
const { redisErrorHandler } = require("./errorHandler");

const redis = createClient({
  password: 'UtdbpUz4JedJY3YHmXMlMWHeXLJcqHyR',
  socket: {
    host: 'redis-18974.c325.us-east-1-4.ec2.cloud.redislabs.com',
    port: 18974
  }
});

redis.on("error", (err) => {
  console.log("REDIS ERROR ", err);
});

redis.on("connect", () => {
  console.log("REDIS - Connected!");
});

const redisSet = redisErrorHandler(async ({ key, val }) => {
  console.log("REDIS SET", { key, val })
  await redis.set(key, val);
});

const redisGet = redisErrorHandler(async () => {
  const keys = await redis.keys('*');
  console.log({ keys });

  return Promise.all(
    keys.map(async (k) => {
      const val = await redis.get(k);
      console.log({ k, val });
      const [lat, lng, name] = val.split(',');
      return { name, lat, lng };
    })
  );
});


module.exports = { redis, redisSet, redisGet };
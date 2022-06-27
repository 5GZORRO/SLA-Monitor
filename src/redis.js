import redis from "redis";

let _redisClient;

const redisClient = {
  async createClient()  {
    if (!_redisClient){
      _redisClient = redis.createClient({ url: process.env.REDIS_URL });

      _redisClient.connect()
      _redisClient.on('connect', function() { console.log('Connected To Redis!'); });
    }
    return _redisClient;
  },
  
  close() {
    _redisClient.close();
  },

  async create(key, value) {
    console.log("Creating new DB entry - key:" + key +" value: " + value)
    if (_redisClient) await _redisClient.set(key, value);
  },

  async delete(key) {
    if (_redisClient) await _redisClient.del(key);
  },

  async read(key) {
    console.log("Reading DB entry - key:" + key)
    if (_redisClient) return await _redisClient.get(key)
  }
};

export default redisClient;
// Config
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';

// Logger
const log = require('../../logging/log')(__filename); 

// Redis
const asyncRedis = require("async-redis");
const client = asyncRedis.createClient({host : REDIS_HOST, port : 6379});

/*
 *  INSERT
 */
exports.insertObject = async(key, obj) => {
    try {
        log.info("INSERT OBJECT: '" + key + "' - '", obj);
        return await client.hmset(key, obj);

    } catch (error) {
        log.error(error.message);

    }
};


exports.insertIfNotExists = async(key, value) => {
    try {
        log.info("SET IF NOT EXISTS"); 
        return await client.setnx(key, value);

    } catch (error) {
        log.error(error.message);

    }
}

/*
 *  GET
 */
exports.getObject = async(key) => {
    try {
        log.info("GET OBJECT: '" + key + "'.");
        return await client.hgetall(key);

    } catch (error) {
        log.error(error.message);

    }
};

exports.getMultipleObjects = async(keys) => {
    try {
        log.info("GET MANY: " + keys);

        let result = [];

        for(key of keys) {
            let reply = await client.hgetall(key);
            result.push(reply);
        }

        return result;

    } catch (error) {
        log.error(error.message);

    }
};

exports.getValueFromObject = async(key, field) => {
    try {
        log.info("GET VALUE FROM OBJECT: '" + key + "' -> '" + field + "'.");

        return await client.hget(key, field);

    } catch (error) {
        log.error(error.message);

    }
};

exports.getKeys = async(pattern) => {
    try {
        log.info("GET KEYS WITH PATTERN: '" + pattern + "'.");
        return await client.keys(pattern);

    } catch (error) {
        log.error(error.message);

    }
};

/*
 *  DELETE
 */
exports.remove = async(key) => {
    try {
        log.info("DELETE: '" + key + "'.");
        return await client.del(key);

    } catch (error) {
        log.error(error.message + ", Key: " + key);

    }
};
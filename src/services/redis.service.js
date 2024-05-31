const redis = require('redis')
const { promisify } = require('util')
const { reservationInvenrory } = require('../models/repositories/inventory.repo')
const redisClient = redis.createClient()

const pexpire = promisify(redisClient.expire).bind(redisClient)
const setnxAsync = promisify(redisClient.setEx).bind(redisClient)

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v203_${productId}`
    const retryTimes = 10
    const expireTime = 3000

    for (let i = 0; i < retryTimes.length; i++) {
        // tao 1 key, thang nao nam giu duoc vao thanh toan
        const result = await setnxAsync(key, expireTime)
        console.log('result::: ', result);

        if (result === 1) {
            // Thao tac voi iventory
            const isRevervation = await reservationInvenrory({
                productId, quantity, cartId
            })
            if (isRevervation.modifiedCount) {
                await pexpire(key, expireTime)
                return key
            }
            return key
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50))
        }

    }
}

const releaseLock = async keyLock => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey(keyLock)
}

module.exports = {
    acquireLock,
    releaseLock
}
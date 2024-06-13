const keyTokenModel = require("../models/keyToken.model");
const { Types } = require('mongoose')
class KeyTokenService {
    static createKeyToken = async ({ userId, publicKey, privateKey, refreshToken }) => {
        try {
            //level 0
            // const tokens = await keyTokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })
            // return tokens ? tokens.publicKey : null

            //level xxx
            const filter = {
                user: userId
            }, update = {
                publicKey, privateKey, refreshTokensUsed: [], refreshToken
            }, options = {
                upsert: true, new: true
            }

            const tokens = await keyTokenModel.findOneAndUpdate(filter, update, options)

            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error
        }
    }

    static findByUserId = async (userId) => {
        return await keyTokenModel.findOne({ user: new Types.ObjectId(userId) })
    }

    static removeKeyById = async (id) => {
        return await keyTokenModel.deleteOne(id).lean();
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        const tokenUsed = await keyTokenModel.findOne({ refreshTokensUsed: refreshToken })
        return tokenUsed
    }

    static findByRefreshToken = async (refreshToken) => {
        const token = await keyTokenModel.findOne({ refreshToken })
        console.log('token: ', token);
        return token
    }

    static deleteKeyById = async (userId) => {
        return await keyTokenModel.findByIdAndDelete({ user: userId }).lean();
    }
}

module.exports = KeyTokenService
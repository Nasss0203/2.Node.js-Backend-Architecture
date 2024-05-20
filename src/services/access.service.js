const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, AuthFailureError } = require("../core/error.response")
const { findByEmail } = require("./shop.sevice")

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR'
}

class AccessService {

    /**
        1 - Check email in db
        2 - Match password 
        3 - create accessToken and refreshToken and save 
        4 - generate tokens
        5 - get data return login
    */
    static login = async ({ email, password, refreshToken = null }) => {
        //1
        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new BadRequestError('Shop not registered')

        //2
        const match = bcrypt.compare(password, foundShop.password)
        if (!match) throw new AuthFailureError('Authentication error')

        //3
        const publicKey = crypto.randomBytes(64).toString('hex')
        const privateKey = crypto.randomBytes(64).toString('hex')

        const { _id: userId } = foundShop
        //4
        const tokens = await createTokenPair({ userId, email }, publicKey, privateKey)

        await KeyTokenService.createKeyToken({
            refreshToken: tokens.accessToken,
            privateKey, publicKey, userId
        })
        return {
            data: getInfoData({ fields: ['_id', 'name', 'email'], object: foundShop }),
            tokens
        }

    }

    static signUp = async ({ name, email, password }) => {
        //step 1: check email exists
        const holderShop = await shopModel.findOne({ email }).lean()
        if (holderShop) {
            throw new BadRequestError('Error: Shop already registered')
        }
        const salt = 10
        const passwordHash = await bcrypt.hash(password, salt)

        const newShop = await shopModel.create({
            name, email, password: passwordHash, roles: [RoleShop.SHOP]
        })

        if (newShop) {
            // create privateKey, publicKey
            const publicKey = crypto.randomBytes(64).toString('hex')
            const privateKey = crypto.randomBytes(64).toString('hex')

            console.log({ privateKey, publicKey }) //save collection keyStore7

            const keyStore = await KeyTokenService.createKeyToken({
                userId: newShop._id,
                publicKey,
                privateKey
            })

            if (!keyStore) {
                return {
                    code: 'xxx',
                    message: 'keyStore error'
                }
            }

            //Created token pair
            const tokens = await createTokenPair({ userId: newShop._id, email }, publicKey, privateKey)
            console.log('Created Token Success:::', tokens);
            return {
                code: 201,
                metadata: {
                    shop: getInfoData({ fields: ['_id', 'name', 'email'], object: newShop }),
                    tokens
                }
            }
        }
        return {
            code: 200,
            metadata: null
        }
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log('delKey: ', delKey);
        return delKey
    }
}

module.exports = AccessService
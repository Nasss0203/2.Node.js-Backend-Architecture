const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const KeyTokenService = require("./keyToken.service")
const { createTokenPair, verifyJWT } = require("../auth/authUtils")
const { getInfoData } = require("../utils")
const { BadRequestError, AuthFailureError, ForbiddenError } = require("../core/error.response")
const { findByEmail } = require("./shop.sevice")

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR'
}

class AccessService {

    /**
     *  Login
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

    /**
        check this token used
     */
    // static hadlerRefreshToken = async (refreshToken) => {
    //     //check xem token da duoc su dung chua
    //     const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
    //     if (foundToken) {
    //         const { userId, email } = await verifyJWT(refreshToken, foundToken.privateKey)
    //         console.log('[1]--', { userId, email })
    //         //xoa tat ca token trong keyStore
    //         await KeyTokenService.deleteKeyById(userId)
    //         throw new ForbiddenError('Something wrong happend!! Please relogin')
    //     }

    //     const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    //     console.log('holderToken: ', holderToken);
    //     if (!holderToken) throw new AuthFailureError('Shop not registered 1')

    //     //verify token 
    //     const { userId, email } = await verifyJWT(refreshToken, holderToken.privateKey)
    //     console.log('[2]--', { userId, email })
    //     //check user _id
    //     const foundShop = await findByEmail({ email })
    //     if (!foundShop) throw new AuthFailureError('Shop not registered')

    //     //creata 1 capjw mois
    //     const tokens = await createTokenPair({ userId, email }, holderToken.publicKey, holderToken.privateKey)

    //     //update token 
    //     await holderToken.updateOne({
    //         $set: {
    //             refreshToken: tokens.refreshToken
    //         },
    //         $addToSet: {
    //             refreshTokensUsed: refreshToken
    //         }
    //     })

    //     return {
    //         user: { userId, email },
    //         tokens
    //     }
    // }

    static hadlerRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {

        const { userId, email } = user
        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenError('Something wrong happend!! Please relogin')
        }

        if (keyStore.refreshToken !== refreshToken) throw new AuthFailureError('Shop not registered') // bug

        const foundShop = await findByEmail({ email })
        if (!foundShop) throw new AuthFailureError('Shop not registered')

        //creata 1 capjw mois
        const tokens = await createTokenPair({ userId, email }, keyStore.publicKey, keyStore.privateKey)

        //update token 
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user,
            tokens
        }

    }
}

module.exports = AccessService
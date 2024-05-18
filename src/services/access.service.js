const shopModel = require("../models/shop.model")
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR'
}

class AccessService {
    static signUp = async ({ name, email, password }) => {
        try {
            //step 1: check email exists
            const holderShop = await shopModel.findOne({ email }).lean()
            if (holderShop) {
                return {
                    code: 'xxx',
                    message: 'Shop already registered'
                }
            }
            const salt = 10
            const passpordHash = await bcrypt.genSalt(password, salt)


            const newShop = shopModel.create({
                name, email, password: passpordHash, roles: [RoleShop.SHOP]
            })

            if (newShop) {
                // create privateKey, publicKey
                const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
                    modulusLength: 4096
                })
                console.log({ privateKey, publicKey }) //save collection keyStore
            }

        } catch (error) {
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        }
    }
}

module.exports = AccessService
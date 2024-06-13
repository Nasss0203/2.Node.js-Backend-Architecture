const { findCartById } = require("../models/repositories/cart.repo")
const { BadRequestError, NotFoundError } = require("../core/error.response")
const { checkProductByServer } = require("../models/repositories/product.repo")
const { getDiscountAmount } = require('./discount.service')
const { product } = require("../models/product.model")
const { acquireLock, releaseLock } = require("./redis.service")
const { order } = require("../models/order.model")

class CheckoutService {
    //login and without login
    /**
{
    "cartId": "665691d43aa175764f7ae0c4",
    "userId": 1001,
    "shop_order_ids": [
        {
            "shopId": "6656ca61aec7c7ec823fabc2",
            "shop_discounts": [
                {
                    "shop_id": "664c39462a92f95564099506",
                    "discountId": "6656ca61aec7c7ec823fabc2",
                    "codeId": "SHOP-1144"
                }
            ],
            "item_products": [
                {
                    "productId": "6656ca9caec7c7ec823fabcd"
                }
            ]
        }
    ]
}
     */
    static async checkoutReview({ cartId, userId, shop_order_ids }) {
        //check cartId ton tai khong
        const foundCart = await findCartById(cartId)
        if (!foundCart) throw new BadRequestError('Cart does not exist!')

        const checkout_order = {
            totalPrice: 0, // Tong tien hang
            feeShip: 0, // phi van chuyen
            totalDiscount: 0, //tong tien discount giam giam
            totalCheckout: 0 // tong thanh toan
        }, shop_order_ids_new = []

        // tinh nang tinh tong bill
        for (let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i]
            //check product available
            const checkProductServer = await checkProductByServer(item_products)
            console.log('checkProductServer: ', checkProductServer);
            if (!checkProductServer) throw new BadRequestError('Order wrong!!!')

            //Tong tien don hang
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            //Tong tin truoc khi xu ly
            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // tien truoc khi giam giam
                priceApplyCheckout: checkoutPrice,
                item_products: checkProductServer
            }

            // neu shop_discounts ton tai > 0, check xem co hop le hay khong
            if (shop_discounts.length > 0) {
                // gia su chi co mot discount
                // get amount discount

                const { totalPrice = 0, discount = 0 } = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })

                //tong cong disscount giam gia
                checkout_order.totalDiscount += discount

                // neu tong tien giam gia lon hon 0
                if (discount > 0) {
                    itemCheckout.priceApplyCheckout = checkoutPrice - discount
                }
            }

            // Tong thanh toan cuoi cung
            checkout_order.totalCheckout += itemCheckout.priceApplyCheckout
            shop_order_ids_new.push(itemCheckout)
        }
        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }


    //order
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }) {
        const { shop_order_ids_new, checkout_order } = await CheckoutService.checkoutReview({
            cartId,
            userId,
            shop_order_ids
        })

        //check lai lan nua xem vuot ton kho hay khong
        //get new array products
        const products = shop_order_ids_new.flatMap(order => order.item_products)
        console.log('[products]: ', products);
        const acquireProduct = []
        for (let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[i]
            const keyLock = await acquireLock(productId, quantity, cartId)
            acquireProduct.push(keyLock ? true : false)
            if (key) {
                await releaseLock(key)
            }
        }

        //chekc neu co mot san pham het hang trong kho
        if (acquireProduct.includes(false)) {
            throw new BadRequestError('Mot so san pham da duoc cap nhat, vui lon quay lai gio hang')
        }


        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: checkout_order,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new
        })

        //Trường hợp: nếu insert thanh coongm thì remove product có trong cart
        if (newOrder) {

        }
        return newOrder
    }


    /*
        1. Query order [Users]
    */
    static async getOneOrderByUser() {

    }

    /*
        2. Query order Using id [Users]
    */
    static async getOrderByUser() {

    }

    /*
        3. Cancel order user [Users]
    */
    static async cancelOrderByUser() {

    }

    /*
        4. Update Order Status  [Shop | Admin]
    */
    static async updateOrderStatusByShop() {

    }
}

module.exports = CheckoutService
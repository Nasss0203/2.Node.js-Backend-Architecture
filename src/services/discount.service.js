
const { BadRequestError, NotFoundError } = require("../core/error.response")
const discountModel = require("../models/discount.model")
const { product } = require("../models/product.model")
const { updateDiscountCodeById, findAllDiscountCodeUnSelect, checkDiscountExists, findAllDiscountCodeSelect } = require("../models/repositories/discount.repo")
const { findAllProducts } = require("../models/repositories/product.repo")
const { convertToObjectIdMongodb } = require("../utils")
/**
 * Discount Services
 * 1 - Generate Discount Code [Shop | Admin]
 * 2 - Get Discount amount [User]
 * 3 - Get all discount codes [User | Shop]
 * 4 - Verify discount code [User]
 * 5 - Delete discount Code [Shop | Admin]
 * 6 - Cancel discount code [User]
 */


class DiscountService {
    static async createDiscountCode(payload) {
        const {
            code, start_date, end_date, is_active, shopId,
            min_order_value, product_ids, applies_to, name,
            description, type, value, max_value, max_uses, uses_count, max_uses_per_user, users_used
        } = payload
        if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
            throw new BadRequestError('Discount code has expried')
        }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError('Start date must be before end date ')
        }

        //create index for discount code 
        const foundDiscount = await discountModel.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()


        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError('Discount exists!')
        }

        const newDiscount = await discountModel.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value || 0,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_apply_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids
        })

        return newDiscount
    }

    static async updateDiscountCode(discountId, payload) {
        return await updateDiscountCodeById({ discountId, payload })
    }

    /**
     * Get all discount codes available with product
     */
    static async getAllDiscountCodesWithProduct({ code, shopId, userId, limit, page }) {
        //Create index for discount_code
        const foundDiscount = await discountModel.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()
        console.log('foundDiscount: ', foundDiscount);


        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError('Discount not exists!')
        }

        const { discount_apply_to, discount_product_ids } = foundDiscount
        let products
        if (discount_apply_to === 'all') {
            //get all product
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name',]
            })
        }

        if (discount_apply_to === 'specific') {
            //get all product ids
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name',]
            })
        }
        return products
    }

    /**
     * Get all discount code of Shop
     */
    static async getAllDiscountCodesByShop({ limit, page, shopId }) {
        const discounts = await findAllDiscountCodeSelect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            select: ['discount_name', 'discount_code'],
            model: discountModel
        })

        return discounts
    }

    /**
        Apply Discount Code
        products = [
            {
                productId,
                shopId,
                quantity,
                name,
                price
            },
            {
                productId,
                shopId,
                quantity,
                name,
                price
            },
        ]
     */
    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        console.log('products: ', products);
        const foundDiscount = await checkDiscountExists({
            model: discountModel,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })
        if (!foundDiscount) throw new NotFoundError(`Discount doesn't exists`)

        const {
            discount_is_active, discount_max_uses,
            discount_min_order_value, discount_start_date,
            discount_end_date, discount_users_used, discount_type,
            discount_value
        } = foundDiscount

        if (!discount_is_active) throw new NotFoundError(`Discount expried!`)
        if (!discount_max_uses) throw new NotFoundError(`Discount are out!`)

        //check xem có set giá trị tối thiểu hay không
        let totalOrder = 0
        if (discount_min_order_value > 0) {
            totalOrder = products.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)
            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(`Discount required a minium order value of ${discount_min_order_value} !`)
            }
        }

        if (discount_min_order_value > 0) {
            const userDiscount = discount_users_used.find(user => user.userId === userId)
            if (userDiscount) {

            }
        }

        //Check discount nay la fixed_amount hay 
        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)
        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        const foundDiscount = ''
        if (foundDiscount) {
            //deleted
        }
        const deleted = await discountModel.find({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
        })

        return deleted
    }

    /**
        Cancel discount code
     */

    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discountModel,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId)
            }
        })

        if (!foundDiscount) throw new NotFoundError(`Discount doesn't exists`)

        const result = await discountModel.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,
            },
            $inc: {
                discount_max_uses: 1,
                discount_uses_count: -1
            }
        })
        return result
    }
}

module.exports = DiscountService
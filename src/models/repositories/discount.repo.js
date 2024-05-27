const { getSelectData, unGetSelectData } = require("../../utils")
const discountModel = require("../discount.model")


const updateDiscountCodeById = async ({ discountId, payload }) => {
    return await discountModel.findByIdAndUpdate(discountId, payload)
}

const findAllDiscountCodeUnSelect = async ({ limit = 50, page = 1, sort = 'ctime', filter, unSelect, model }) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const discounts = await discountModel.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(unGetSelectData(unSelect))
        .lean()

    return discounts
}

const findAllDiscountCodeSelect = async ({ limit = 50, page = 1, sort = 'ctime', filter, select, model }) => {
    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? { _id: -1 } : { _id: 1 }
    const discounts = await discountModel.find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limit)
        .select(getSelectData(select))
        .lean()

    return discounts
}

const checkDiscountExists = async ({ model, filter }) => {
    return await model.findOne(filter).lean()

}

module.exports = {
    updateDiscountCodeById,
    findAllDiscountCodeUnSelect,
    findAllDiscountCodeSelect,
    checkDiscountExists
}
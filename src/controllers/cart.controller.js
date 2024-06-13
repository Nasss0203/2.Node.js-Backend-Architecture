const { CREATED, SuccessResponse } = require("../core/success.response")
const CartService = require("../services/cart.service")

class CartController {

    addToCart = async (req, res, next) => {
        //new 
        new SuccessResponse({
            message: "Create new Cart success",
            metadata: await CartService.addToCart(req.body)
        }).send(res)
    }

    updateCart = async (req, res, next) => {
        //new 
        new SuccessResponse({
            message: "Update cart success",
            metadata: await CartService.addToCartV2(req.body)
        }).send(res)
    }

    deleteCart = async (req, res, next) => {
        //new 
        new SuccessResponse({
            message: "Delete Cart success",
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res)
    }


    listToCart = async (req, res, next) => {
        //new 
        new SuccessResponse({
            message: "List Cart success",
            metadata: await CartService.getListUserCart(req.query)
        }).send(res)
    }


}

module.exports = new CartController()
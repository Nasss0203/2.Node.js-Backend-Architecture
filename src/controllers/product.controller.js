const ProductService = require('../services/product.service')
const ProductServiceV2 = require('../services/product.service.xxx')
const { SuccessResponse } = require('../core/success.response')

class ProductController {
    createProduct = async (req, res, next) => {
        // new SuccessResponse({
        //     message: 'Success new create product',
        //     metadata: await ProductService.createProduct(req.body.product_type, {
        //         ...req.body,
        //         product_shop: req.user.userId
        //     })
        // }).send(res)
        new SuccessResponse({
            message: 'Success new create product',
            metadata: await ProductServiceV2.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'publishProductByShop product',
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }


    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'unPublishProductByShop product',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    // QUERY //
    /**
     * @description Get all Drafts for shop
     * @param {Number} limit 
     * @param {Number} skip 
     * @returns {JSON}
     */
    getAllDraftsForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Draft Success!',
            metadata: await ProductServiceV2.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list Publish Success!',
            metadata: await ProductServiceV2.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res)
    }

    getListSearchProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'getListSearchProduct Success!',
            metadata: await ProductServiceV2.getListSearchProduct(req.params)
        }).send(res)
    }

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'findAllProducts Success!',
            metadata: await ProductServiceV2.findAllProducts(req.query)
        }).send(res)
    }
    findProductById = async (req, res, next) => {
        new SuccessResponse({
            message: 'findProductById Success!',
            metadata: await ProductServiceV2.findProductById({
                product_id: req.params.product_id
            })
        }).send(res)
    }
    // END QUERY //
}

module.exports = new ProductController()
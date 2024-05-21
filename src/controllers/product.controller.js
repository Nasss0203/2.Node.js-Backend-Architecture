const ProductService = require('../services/product.service')
const { SuccessResponse } = require('../core/success.response')

class ProductController {
    createProduct = async (req, res, next) => {

        new SuccessResponse({
            message: 'Success new create product',
            metadata: await ProductService.createProduct(req.body.product_type, req.body)
        })
    }
}

module.exports = new ProductController()
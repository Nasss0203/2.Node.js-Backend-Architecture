const { Schema, model } = require("mongoose");

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

const productSchema = new Schema({
    product_name: {
        type: String,
        required: true
    },
    product_thumb: {
        type: String,
        required: true
    },
    product_description: String,
    product_price: {
        type: Number,
        required: true
    },
    product_quantity: {
        type: Number,
        required: true
    },
    product_type: {
        type: Number,
        required: true,
        enum: ['Electronics', 'Clothing', 'Furniture']
    },
    product_shop: {
        type: Schema.Types.ObjectId, ref: 'Shop'
    },
    product_attributes: {
        type: Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

//define to product type = Clothing

const clothingSchema = new Schema({
    brand: { type: String, required: true },
    size: String,
    material: String
}, {
    timestamps: true,
    collection: 'clothes'
})

const electronicSchema = new Schema({
    manufacturer: { type: String, required: true },
    model: String,
    color: String
}, {
    timestamps: true,
    collection: 'electronics'
})

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronics', electronicSchema),
    clothing: model('Clothing', clothingSchema),
}
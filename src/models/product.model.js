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
        type: String,
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
    brand: { type: String, require: true },
    size: String,
    material: String,
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    }
}, {
    timestamps: true,
    collection: 'clothes'
})

const electronicSchema = new Schema({
    manufacturer: { type: String, require: true },
    model: String,
    color: String,
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    }
}, {
    timestamps: true,
    collection: 'electronics'
})

const furnitureSchema = new Schema({
    brand: { type: String, require: true },
    size: String,
    material: String,
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    }
}, {
    timestamps: true,
    collection: 'furnitures'
})

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronics', electronicSchema),
    clothing: model('Clothing', clothingSchema),
    furniture: model('Furniture', furnitureSchema),
}
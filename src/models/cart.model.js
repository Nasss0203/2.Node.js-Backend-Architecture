const { Schema, default: mongoose } = require("mongoose");

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'carts'
// Declare the Schema of the Mongo model
let cartSchema = new Schema({
    cart_state: { type: String, required: true, enum: ['acive', 'completed', 'failed', 'pending'] },
    cart_products: { type: Array, required: true, default: [] },
    cart_count_product: { type: Number, default: 0 },
    cart_userId: { type: Number, required: true },

}, {
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
    collection: COLLECTION_NAME
});

//Export the model
module.exports = {
    cart: mongoose.model(DOCUMENT_NAME, cartSchema)
}
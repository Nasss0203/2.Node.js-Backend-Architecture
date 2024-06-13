const { Schema, default: mongoose } = require("mongoose");

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'
// Declare the Schema of the Mongo model
let orderSchema = new Schema({
    order_userId: { type: Number, require: true },
    order_checkout: { type: Object, defalt: {} },
    /*
        order_checkout = {
            totalPrice,
            totalApllyDiscount,
            feeShip
        }
    */
    order_shipping: { type: Object, defalt: {} },
    /*
        street, city, state, country
  */
    order_payment: { type: Object, default: {} },
    order_products: { type: Array, required: true },
    order_tracking: { type: Object, default: '#0000131052024' },
    order_status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'], default: 'pending' },

}, {
    timestamps: {
        createdAt: 'createdOn',
        updatedAt: 'modifiedOn'
    },
    collection: COLLECTION_NAME
});

//Export the model
module.exports = {
    order: mongoose.model(DOCUMENT_NAME, orderSchema),
}
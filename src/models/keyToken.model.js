const { Schema, default: mongoose } = require("mongoose");

const DOCUMENT_NAME = 'Key'
const COLLECTION_NAME = 'Keys'
// Declare the Schema of the Mongo model
let keyTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Shop"
    },
    privateKey: {
        type: String,
        required: true,
    },
    publicKey: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: Array,
        default: []
    },
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, keyTokenSchema);
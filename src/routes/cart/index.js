const express = require('express')
const cartController = require('../../controllers/cart.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()

router.post('', asyncHandler(cartController.addToCart))
router.get('', asyncHandler(cartController.listToCart))
router.delete('', asyncHandler(cartController.deleteCart))
router.post('/update', asyncHandler(cartController.updateCart))




module.exports = router
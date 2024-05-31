const express = require('express')
const inventoryControler = require('../../controllers/inventory.controller')
const { asyncHandler } = require('../../helpers/asyncHandler')
const { authenticationV2 } = require('../../auth/authUtils')
const router = express.Router()


router.use(authenticationV2)
router.post('/', asyncHandler(inventoryControler.addStockToInventory))




module.exports = router
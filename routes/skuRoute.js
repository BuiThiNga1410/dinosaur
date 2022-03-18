const express = require("express");
const router = express.Router();
const skuController = require("../controller/skuController");
const { loginCheck } = require("../middleware/auth");

router.post("", skuController.getSkuByProduct);

module.exports = router;

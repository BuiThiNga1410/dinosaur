const express = require("express");
const router = express.Router();
const productsController = require("../controller/productsController");
const { loginCheck } = require("../middleware/auth");

router.get("", productsController.getAllProduct);
router.post("", loginCheck, productsController.addProduct);
router.post("/add-review", loginCheck, productsController.postAddReview);
router.put("/:productId", loginCheck, productsController.editProduct);
router.get("/:productId", productsController.getSingleProduct);
router.delete("/:productId", loginCheck, productsController.deleteProduct);

router.post("/product-category", productsController.getProductByCategory);

module.exports = router;

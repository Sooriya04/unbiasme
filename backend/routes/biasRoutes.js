const express = require("express");
const router = express.Router();
const biasController = require("../controllers/biasController");

router.get("/today", biasController.getBiasOfTheDay);

module.exports = router;

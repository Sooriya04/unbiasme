const express = require("express");
const router = express.Router();
const Bias = require("../models/bias");

router.get("/bias-of-the-day", async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  try {
    const bias = await Bias.findOne({ date: { $gte: start, $lte: end } });
    if (!bias)
      return res.send("Bias not available yet. Please check back soon.");
    res.render("pages/bias", { bias });
  } catch (err) {
    console.error("Error loading bias:", err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Bias = require("../models/bias");
const { generateRandomBias } = require("../services/geminiBiasService");

router.get("/bias-of-the-day", async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  try {
    // Step 1: Check if today's bias already exists
    let bias = await Bias.findOne({ date: { $gte: start, $lte: end } });

    // Step 2: If not, generate and store a new bias
    if (!bias) {
      bias = await generateRandomBias();

      if (!bias) {
        return res.send(
          "⚠️ Could not generate a new bias. Please try again later."
        );
      }
    }

    res.render("pages/bias", { bias });
  } catch (err) {
    console.error("Error loading bias:", err);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;

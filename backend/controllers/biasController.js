const Bias = require("../models/bias");
const { generateRandomBias } = require("../services/geminiBiasService");
const asyncHandler = require("../utils/asyncHandler");

/* ═══════════════ GET BIAS OF THE DAY ═══════════════ */

const getBiasOfTheDay = asyncHandler(async (req, res) => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    let bias = await Bias.findOne({ date: { $gte: start, $lte: end } });

    if (!bias) {
        bias = await generateRandomBias();
        if (!bias) {
            return res.status(500).json({
                success: false,
                message: "Could not generate a new bias. Please try again later.",
            });
        }
    }

    res.json({ success: true, bias });
});

module.exports = { getBiasOfTheDay };

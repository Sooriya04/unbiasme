const User = require("../models/user");
const asyncHandler = require("../utils/asyncHandler");

/* ═══════════════ GET PROFILE ═══════════════ */

const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
});

/* ═══════════════ UPDATE PROFILE ═══════════════ */

const updateProfile = asyncHandler(async (req, res) => {
    const { name, gender, dob, age } = req.body;

    await User.updateOne({ _id: req.user._id }, { name, gender, dob, age });

    const updatedUser = await User.findById(req.user._id).select("-password");
    res.json({ success: true, message: "Profile updated", user: updatedUser });
});

module.exports = { getProfile, updateProfile };

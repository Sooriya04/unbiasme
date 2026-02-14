const jwt = require("jsonwebtoken");

/**
 * Generate a JWT token for the given user.
 * @param {Object} user - Mongoose user document
 * @returns {string} Signed JWT token
 */
const generateToken = (user) => {
    return jwt.sign(
        { _id: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

module.exports = generateToken;

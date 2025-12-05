// models/PasswordReset.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const passwordResetSchema = new mongoose.Schema(
    {
        employeeId: {
            type: String,
            required: true,
            trim: true
        },
        tokenHash: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 } // TTL index - MongoDB will auto-delete expired documents
        },
        used: {
            type: Boolean,
            default: false
        },
        usedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

// Static method to create a reset token
passwordResetSchema.statics.createResetToken = function (employeeId) {
    // Generate random token
    const token = crypto.randomBytes(32).toString('hex');

    // Hash the token for storage
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Set expiry to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    return {
        token, // Return plain token to send in email
        tokenHash, // Store hashed version in DB
        expiresAt
    };
};

// Static method to verify a token
passwordResetSchema.statics.verifyToken = async function (token) {
    // Hash the provided token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find matching reset request
    const resetRequest = await this.findOne({
        tokenHash,
        expiresAt: { $gt: new Date() }, // Not expired
        used: false // Not already used
    });

    return resetRequest;
};

module.exports = mongoose.model('PasswordReset', passwordResetSchema);

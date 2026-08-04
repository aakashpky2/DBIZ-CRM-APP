const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    userType: {
        type: String,
        required: [true, 'Please select a user type'],
        enum: [
            'Taxpayer',
            'Tax Deductor',
            'Tax Collector (e-Commerce)',
            'GST Practitioner',
            'Non Resident Taxable Person',
            'United Nation Body',
            'Consulate or Embassy of Foreign Country',
            'Other Notified Person',
            'Non-Resident Online Services Provider and/or Non-Resident Online Money Gaming Supplier'
        ]
    },
    state: {
        type: String,
        required: [true, 'Please select a state']
    },
    district: String,
    legalName: {
        type: String,
        required: [true, 'Please add a legal name']
    },
    pan: {
        type: String,
        sparse: true,
        match: [
            /[A-Z]{5}[0-9]{4}[A-Z]{1}/,
            'Please add a valid PAN'
        ]
    },
    tan: String,
    passportNumber: String,
    tin: String,
    authSignatoryName: String,
    authSignatoryPan: String,
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    mobile: {
        type: String,
        required: [true, 'Please add a mobile number']
    },
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    trn: String,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    isMobileVerified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.GST_JWT_SECRET || process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);

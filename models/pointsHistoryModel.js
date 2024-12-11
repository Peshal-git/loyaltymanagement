const mongoose = require('mongoose')

const pointsHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionType: {
        type: String,
        enum: ['add', 'subtract'],
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    totalPointsBefore: {
        type: Number,
        required: true
    },
    totalPointsAfter: {
        type: Number,
        required: true
    },
    service: {
        type: String,
        required: true
    },
    tranCode: {
        type: String
    },
    transactionDate: {
        type: Date,
        default: Date.now,
        index: true
    }
})

const PointsHistory = mongoose.model('PointsHistory', pointsHistorySchema);

module.exports = PointsHistory;
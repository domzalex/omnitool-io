const mongoose = require('mongoose')

const quizSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    length: {
        type: Number,
        required: true,
    },
    questions: [
        {
            type: String,
            required: true,
        },
    ],
    answers: [
        [
            {
                type: String,
                required: true,
            },
        ]
        
    ],
})

const Quiz = mongoose.model('Quiz', quizSchema)

module.exports = Quiz
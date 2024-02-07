const express = require('express')
const mongoose = require('mongoose')
const ejs = require('ejs')
const path = require('path')
const bodyParser = require('body-parser')
require('dotenv').config()
const Quizzes = require('./models/quiz')

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use('/static', express.static('static'))
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')

const mongoURI = process.env.DB_CONNECT

mongoose.connect(mongoURI, { useNewUrlParser: true })

app.use(express.static(path.join(__dirname, '../frontend')))

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})


//MAIN DOMAIN ROUTES

app.get('/', (req, res) => {
    res.render('main/home.ejs')
})





// QUIZ-CREATOR ROUTES

app.get('/quiz-creator/data', async (req, res) => {
    try {
        const result = await Quizzes.find()
        res.json(result)
    } catch (error) {
        console.error('Error:', error)
        res.status(500).send('Internal Server Error')
    }
})
app.post('/quiz-creator/postQuiz', async (req, res) => {
    try {

        const newQuiz = new Quizzes(req.body)
        await newQuiz.save();

        res.status(201).json({ 
            id: newQuiz._id, 
            message: 'Data successfully saved to the database.' });
    } catch (error) {
        console.error('Error:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
})
app.get('/quiz-creator', (req, res) => {
    Quizzes.find({})
    .then(quizzes => {
        res.render('quiz-creator/home.ejs', { allQuizzes: quizzes })
    })
});
app.get('/quiz-creator/create', (req, res) => {
    res.render('quiz-creator/create.ejs')
});
app.get('/quiz-creator/quiz/:id', async (req, res) => {
    try {
        const quizData = await Quizzes.findById(req.params.id);
        if (!quizData) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        res.render('quiz-creator/quiz.ejs', { quizData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})
require('dotenv').config()
const mongoose = require('mongoose')
const path = require('path')

mongoose.connect('mongodb://127.0.0.1:27017/loginapis').then(() => {
    console.log("Connected to database")
})

const express = require('express')
const session = require('express-session')
const app = express()
const hbs = require('hbs')
const passport = require('passport')
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))

const staticPath = path.join(__dirname, "/public")
const templatesPath = path.join(__dirname, "/templates/views")
const partialsPath = path.join(__dirname, "/templates/partials")
app.use(express.static(staticPath))

app.set('view engine', 'hbs')
app.set('views', templatesPath)
hbs.registerPartials(partialsPath)

const port = process.env.SERVER_PORT | 8000

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

const userRoute = require('./routes/userRoute')
app.use('/api', userRoute)

const authRoute = require('./routes/authRoute')
app.use('/', authRoute)

const socialAuthRoute = require('./routes/socialAuthRoute')
app.use('/auth', socialAuthRoute)

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
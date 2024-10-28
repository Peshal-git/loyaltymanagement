require('dotenv').config()
const mongoose = require('mongoose')
const path = require('path')
require('./helpers/hbsHelpers')

mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`).then(() => {
    console.log("Connected to database")
})

const express = require('express')
const app = express()
const session = require('express-session')

const hbs = require('hbs')
const passport = require('passport')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser');
app.use(cookieParser())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(bodyParser.urlencoded({ extended: true }))

const staticPath = path.join(__dirname, "/public")
const templatesPath = path.join(__dirname, "/templates/views")
const partialsPath = path.join(__dirname, "/templates/partials")
app.use(express.static(staticPath))

app.set('view engine', 'hbs')
app.set('views', templatesPath)
hbs.registerPartials(partialsPath)

const port = process.env.PORT | 8000

const authRoute = require('./routes/authRoute')
app.use('/auth', authRoute)

const publicRoute = require('./routes/publicRoute')
app.use('/', publicRoute)

const userRoute = require('./routes/userRoute')
app.use('/', userRoute)

const adminRoute = require('./routes/adminRoute')
app.use('/', adminRoute)

const apiRoute = require('./routes/apiRoute')
app.use('/api', apiRoute)

app.use((req, res) => {
    res.redirect('/');
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
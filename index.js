require("dotenv").config()
require("./src/config/database")
const express = require("express")
const session = require("express-session")
const passport = require("./src/config/passport")
const authRoutes = require("./src/routes/authRoutes")
const path = require("path")

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, "views")))

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"))
})

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"))
})

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"))
})

app.get("/profile", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "profile.html"))
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
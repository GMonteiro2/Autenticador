const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth20").Strategy
const db = require("./database")
const { v4: uuidv4 } = require("uuid")

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/api/auth/callback"
}, (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value
  const name = profile.displayName

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return done(err)

    if (results.length > 0) {
      return done(null, results[0])
    }

    const id = uuidv4()

    db.query(
      "INSERT INTO users (id, name, email, password, is_verified) VALUES (?, ?, ?, ?, ?)",
      [id, name, email, "", true],
      (err) => {
        if (err) return done(err)
        db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
          if (err) return done(err)
          return done(null, results[0])
        })
      }
    )
  })
}))

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser((id, done) => {
  db.query("SELECT * FROM users WHERE id = ?", [id], (err, results) => {
    done(err, results[0])
  })
})

module.exports = passport
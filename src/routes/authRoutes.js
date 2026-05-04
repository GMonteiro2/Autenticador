const express = require("express")
const router = express.Router()
const { register, login, verifyEmail, resetPassword, newPassword, getProfile } = require("../controllers/authController")
const authToken = require("../middlewares/authMiddleware")
const passport = require("../config/passport")
const jwt = require("jsonwebtoken")

router.post("/register", register)
router.post("/login", login)
router.get("/verify-email", verifyEmail)
router.post("/reset-password", resetPassword)
router.post("/new-password", newPassword)
router.get("/oauth", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get("/callback",
  passport.authenticate("google", { failureRedirect: "/api/auth/login", session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    )
    res.json({ token })
  }
)

router.get("/profile", authToken, getProfile)

module.exports = router
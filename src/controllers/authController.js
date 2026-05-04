const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const db = require("../config/database")
const mailer = require("../config/mailer")
const { v4: uuidv4 } = require("uuid")


function register(req, res) {
  const { name, email, password } = req.body

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Erro no servidor" })

    if (results.length > 0) {
      return res.status(400).json({ message: "Email já cadastrado" })
    }

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return res.status(500).json({ message: "Erro ao criar senha" })

      const id = uuidv4()
      const verificationToken = crypto.randomBytes(32).toString("hex")

      db.query(
        "INSERT INTO users (id, name, email, password, verification_token) VALUES (?, ?, ?, ?, ?)",
        [id, name, email, hash, verificationToken],
        (err) => {
          if (err) return res.status(500).json({ message: "Erro ao cadastrar usuário" })

          const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${verificationToken}`

          mailer.sendMail({
            from: process.env.GMAIL_USER,
            to: email,
            subject: "Verifique seu email",
            html: `<p>Olá ${name}! Clique no link abaixo para verificar seu email:</p>
                   <a href="${verificationLink}">Verificar email</a>`
          }, (err) => {
            if (err) return res.status(500).json({ message: "Erro ao enviar email" })
            res.status(201).json({ message: "Usuário cadastrado! Verifique seu email." })
          })
        }
      )
    })
  })
}


function login(req, res) {
  const { email, password } = req.body

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Erro no servidor" })

    if (results.length === 0) {
      return res.status(401).json({ message: "Credenciais inválidas" })
    }

    const user = results[0]

    if (!user.is_verified) {
      return res.status(401).json({ message: "Email não verificado" })
    }

    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) {
        return res.status(401).json({ message: "Credenciais inválidas" })
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      )

      res.json({ token })
    })
  })
}


function verifyEmail(req, res) {
  const { token } = req.query

  if (!token) return res.status(400).json({ message: "Token não fornecido" })

  db.query("SELECT * FROM users WHERE verification_token = ?", [token], (err, results) => {
    if (err) return res.status(500).json({ message: "Erro no servidor" })

    if (results.length === 0) {
      return res.status(400).json({ message: "Token inválido" })
    }

    db.query(
      "UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = ?",
      [token],
      (err) => {
        if (err) return res.status(500).json({ message: "Erro ao verificar email" })
        res.json({ message: "Email verificado com sucesso!" })
      }
    )
  })
}


function resetPassword(req, res) {
  const { email } = req.body

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ message: "Erro no servidor" })

    if (results.length === 0) {
      return res.status(404).json({ message: "Email não encontrado" })
    }

    const resetToken = crypto.randomBytes(32).toString("hex")
    const expiry = new Date(Date.now() + 3600000) // 1 hora

    db.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?",
      [resetToken, expiry, email],
      (err) => {
        if (err) return res.status(500).json({ message: "Erro no servidor" })

        const resetLink = `http://localhost:3000/api/auth/new-password?token=${resetToken}`

        mailer.sendMail({
          from: process.env.GMAIL_USER,
          to: email,
          subject: "Recuperação de senha",
          html: `<p>Clique no link abaixo para redefinir sua senha:</p>
                 <a href="${resetLink}">Redefinir senha</a>
                 <p>O link expira em 1 hora.</p>`
        }, (err) => {
          if (err) return res.status(500).json({ message: "Erro ao enviar email" })
          res.json({ message: "Email de recuperação enviado!" })
        })
      }
    )
  })
}

function newPassword(req, res) {
  const { token } = req.query
  const { password } = req.body

  if (!token) return res.status(400).json({ message: "Token não fornecido" })

  db.query(
    "SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
    [token],
    (err, results) => {
      if (err) return res.status(500).json({ message: "Erro no servidor" })

      if (results.length === 0) {
        return res.status(400).json({ message: "Token inválido ou expirado" })
      }

      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ message: "Erro ao criar senha" })

        db.query(
          "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ?",
          [hash, token],
          (err) => {
            if (err) return res.status(500).json({ message: "Erro ao atualizar senha" })
            res.json({ message: "Senha atualizada com sucesso!" })
          }
        )
      })
    }
  )
}

function getProfile(req, res) {
  db.query("SELECT id, name, email, is_verified, created_at FROM users WHERE id = ?", [req.user.id], (err, results) => {
    if (err) return res.status(500).json({ message: "Erro no servidor" })

    if (results.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado" })
    }

    res.json({ user: results[0] })
  })
}

module.exports = { register, login, verifyEmail, resetPassword, newPassword, getProfile }
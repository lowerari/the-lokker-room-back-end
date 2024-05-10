import { pool } from './db.js'
import bcrypt from 'bcrypt'
import JWT from 'jsonwebtoken'
import dotenv from 'dotenv'
import { promisify } from 'util'
import { rateLimit } from 'express-rate-limit'

// Loading variables from the .env file
dotenv.config()

await pool.connect()

// Promisify the JWT helpers
// => transform callback into Promise based function (async)
const sign = promisify(JWT.sign)
const verify = promisify(JWT.verify)

export const register = async (req, res) => {
  const { email, nickname, password, team } = req.body

  if (!email || !password || !nickname || !team)
    return res.status(400).send({ error: 'Invalid request' })

  try {
    const encryptedPassword = await bcrypt.hash(password, 10)

    await pool.query(
      'INSERT INTO users (email, password, nickname, team) VALUES ($1, $2, $3, $4)',
      [email, encryptedPassword, nickname, team]
    )

    return res.send({ info: 'User succesfully created' })
  } catch (err) {
    console.log(err)

    return res.status(500).send({ error: 'Internal server error' })
  }
}

// Create a rate limiter middleware to limit login attempts
export const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour (milliseconds)
    max: 5, // Maximum 5 failed login attempts per hour
    message: { error: 'Too many login attempts. Please try again later.' },
});

export const login = async (req, res) => {
    const { email, password } = req.body
  
    if (!email || !password)
      return res.status(400).send({ error: 'Invalid request' })
  
    const q = await pool.query(
      'SELECT password, id, nickname, team from users WHERE email=$1',
      [email]
    )
  
    if (q.rowCount === 0) {
      return res.status(404).send({ error: 'This user does not exist' })
    }
  
    const result = q.rows[0]
    const match = await bcrypt.compare(password, result.password)
  
    if (!match) {
      return res.status(403).send({ error: 'Wrong password' })
    }
  
    try {
      const token = await sign(
        { id: result.id, nickname: result.nickname, email, team: result.team },
        process.env.JWT_SECRET,
        {
          algorithm: 'HS512',
          expiresIn: '8h',
        }
      )
  
      return res.send({ token })
    } catch (err) {
      console.log(err)
      return res.status(500).send({ error: 'Cannot generate token' })
    }
}



// This middleware will ensure that all subsequent routes include a valid token in the authorization header
// The 'user' variable will be added to the request object, to be used in the following request listeners
export const jwtVerify = async (req, res, next) => {
    if (!req.headers.authorization) return res.status(401).send('Unauthorized')
  
    try {
      const decoded = await verify(
        req.headers.authorization.split(' ')[1],
        process.env.JWT_SECRET
      )
  
      if (decoded !== undefined) {
        req.user = decoded
        return next()
      }
    } catch (err) {
      console.log(err)
    }
  
    return res.status(403).send('Invalid token')
}


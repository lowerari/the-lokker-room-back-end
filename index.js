import express from 'express'
import cors from 'cors'
import { connectionRoute } from './routers/connection.js'
import { lobbiesRoute } from './routers/lobbies.js'
import { messagesRoute } from './routers/messages.js'
import { directMessagesRoute } from './routers/directMessages.js'

// Launching express
const app = express()
app.use(cors())

// Use the json middleware to parse the request body
app.use(express.json())

app.get("/api/test", (req, res) => {
    res.send({msg: 'here is the backend speaking to you'})
})

app.use('/api', connectionRoute)

app.use('/api/lobbies', lobbiesRoute)

app.use('/api', messagesRoute)

app.use('/api/direct_messages', directMessagesRoute)

// app.get('/api/users', async (req, res) => {
//   const q = await pool.query('SELECT nickname, team from users')
//   return res.send(q.rows)
// })

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, () => console.log(port))
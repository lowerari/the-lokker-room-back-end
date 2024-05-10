import { pool } from './db.js'
import bcrypt from 'bcrypt'

await pool.connect();

export const sayHello = async (req, res) => {
    res.send({ info: 'Hello ' + req.user.nickname })
}

export const user = async (req, res) => {
    const userId = req.user.id;
  
    const q = await pool.query('SELECT * FROM users WHERE id = $1', [userId])
  
    try{
      return res.send(q.rows)
    }catch(err){
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
}

export const makeLobby = async (req, res) => {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required for the lobby' });
    }

    try {
        // Get user ID from decoded JWT token
        const userId = req.user.id;
        const team = req.user.team;
    
        // Create a new lobby in the database
        await pool.query('INSERT INTO lobbies (name, user_id, team) VALUES ($1, $2, $3)',
        [name, userId, team]);
    
        return res.send({ info: `Lobby: ${name} succesfully created`});
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
      }
}

export const viewLobbies = async (req, res) => {
    const userId = req.user.id;
    const userTeam = req.user.team;

    const q = await pool.query('SELECT * FROM lobbies WHERE user_id = $1 OR team = $2', [userId, userTeam])

    try{
        return res.send(q.rows)
    }catch(err){
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const addNewUser = async (req, res) => {
    try{
        const lobbyId = req.params.lobbyID;
        const userId  = req.user.id;

        //New user details
        const { newUserEmail } = req.body;
        const { newUserNickname } = req.body;
        const { newUserPassword } = req.body;
        const encryptedPassword = await bcrypt.hash(newUserPassword, 10);
        const team = req.user.team;

        //confirm user is admin of lobby
        const result = await pool.query(
            'SELECT * FROM lobbies WHERE id = $1 AND user_id = $2',
            [lobbyId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Lobby not found or you are not the admin' });
        }

        //create new user
        await pool.query(
            'INSERT INTO users (email, password, nickname, team) VALUES ($1, $2, $3, $4)',
            [newUserEmail, encryptedPassword, newUserNickname, team]
        );
      
        //send confirmation message
        return res.send({ info: `New user: ${newUserNickname} successfully created.` });
    }catch (err){
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
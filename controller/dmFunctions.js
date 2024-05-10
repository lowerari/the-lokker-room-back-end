import { pool } from './db.js'

await pool.connect();

export const directMessages = async(req, res) => {
    try{
        const dmLobbyId = req.params.userID;
        const userId = req.user.id;
        console.log(userId);
        console.log(dmLobbyId);

        const q = await pool.query('SELECT dm.*, u.nickname as sender_nickname FROM dm LEFT JOIN "users" u ON dm.sender_id = u.id WHERE dm.recipient_id = $1 OR dm.sender_id = $1 ORDER BY dm.created_at DESC;', [userId]);

        if(dmLobbyId != userId){
            return res.status(403).json({ error: 'These aint your dms fool' });
        }

        if(q.rowCount === 0){
            return res.status(404).json({ error: 'You have no messages :(' })
        }

        return res.send(q.rows);
    }catch (err){
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const sentMessages = async(req, res) => {
    try{
        const dmLobbyId = req.params.userID;
        const userId = req.user.id;
        console.log(userId);
        console.log(dmLobbyId);

        const q = await pool.query('SELECT * FROM dm WHERE sender_id = $1', [userId]);

        if(dmLobbyId != userId){
            return res.status(403).json({ error: 'These aint your dms fool' });
        }

        if(q.rowCount === 0){
            return res.status(404).json({ error: 'You sent no messages :(' })
        }

        return res.send(q.rows);
    }catch (err){
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const newDM = async(req, res) => {
    try{
        const sender = req.user.id;
        const { messageRecipient, directMessage } = req.body;

        // Check if the recipient exists in the users table
        const recipientQuery = await pool.query('SELECT id FROM users WHERE email = $1', [messageRecipient]);
        const recipient = recipientQuery.rows[0];

        if(!recipient){
            return res.status(404).json({error: 'Recipient not found'});
        }

        const recipientId = recipient.id; // Extract recipient ID from the query result

        await pool.query(
            'INSERT INTO dm (recipient_id, message_content, sender_id) VALUES ($1, $2, $3)',
            [recipientId, directMessage, sender]
        )

        return res.send({info: 'Message sent!'});
    }catch (err){
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
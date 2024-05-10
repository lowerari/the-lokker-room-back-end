import { pool } from './db.js'

await pool.connect();

export const viewMessages = async(req, res) => {
    try{
        const lobbyID = req.params.lobbyID;
        const userTeam = req.user.team;

        // Check if the user's team matches the lobby's team
        const lobbyQuery = await pool.query(
            'SELECT team FROM lobbies WHERE id = $1',
            [lobbyID]
        );

        if (lobbyQuery.rowCount === 0) {
            return res.status(404).json({ error: 'Lobby not found' });
        }

        const lobbyTeam = lobbyQuery.rows[0].team;

        if (userTeam !== lobbyTeam) {
            return res.status(403).json({ error: 'You do not have access to this lobby' });
        }

        // Extract pagination parameters from query string or use default values
        //The page and limit parameters are extracted from the query string. If not provided, default values are used (page = 1 and limit = 10).
        const { page = 1, limit = 10 } = req.query;
        //The offset is calculated based on the page and limit parameters to determine the starting index for pagination.
        const offset = (page - 1) * limit;



        // Retrieve messages for the specified lobby from the database
        //The SQL query retrieves messages for the specified lobby with pagination using the LIMIT and OFFSET clauses, and orders them by created_at in descending order
        const q = await pool.query(
            'SELECT m.*, u.nickname AS sender_nickname FROM messages m JOIN users u ON m.sender_id = u.id WHERE lobby_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
            [lobbyID, limit, offset]
        );

        // Send the messages as the response
        return res.send(q.rows);
        //You can now make requests to this endpoint with optional query parameters page and limit to paginate through the messages. For example:
            //'/api/lobbies/:lobbyID/messages?page=1&limit=10': Retrieves the first 10 messages for the specified lobby.
            //'/api/lobbies/:lobbyID/messages?page=2&limit=10': Retrieves the next 10 messages for the specified lobby.
    }catch (err){
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const newMessage = async(req, res) => {
    try{
        const lobbyID = req.params.lobbyID;

        const userTeam = req.user.team;

        const userId = req.user.id;

        const { message } = req.body;

        // Check if the user's team matches the lobby's team
        const lobbyQuery = await pool.query(
            'SELECT team FROM lobbies WHERE id = $1',
            [lobbyID]
        );

        if (lobbyQuery.rowCount === 0) {
            return res.status(404).json({ error: 'Lobby not found' });
        }

        const lobbyTeam = lobbyQuery.rows[0].team;

        if (userTeam !== lobbyTeam) {
            return res.status(403).json({ error: 'You do not have permission to post a message to this lobby' });
        }

        await pool.query(
            'INSERT INTO messages (content, lobby_id, sender_id) VALUES ($1, $2, $3)',
            [message, lobbyID, userId]
        )

        return res.send({ info: `Message sent successfully`});
    }catch (err){
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const editMessage = async(req, res) =>{
    try{
        const lobbyID = req.params.lobbyID;
        const messageID = req.params.messageID;
        const userId = req.user.id;
        const { newContent } = req.body;

        // Check if the message exists and belongs to the user or if the user is the admin of the lobby the message is in
        const messageQuery = await pool.query(
            'SELECT * FROM messages m JOIN lobbies l ON m.lobby_id = l.id WHERE m.id = $1 AND m.lobby_id = $2 AND (m.sender_id = $3 OR l.user_id = $3)',
            [messageID, lobbyID, userId]
        );

        if (messageQuery.rowCount === 0) {
            return res.status(404).json({ error: 'Message not found or you do not have permission to edit it' });
        }

        // Update the message content
        await pool.query(
            'UPDATE messages SET content = $1 WHERE id = $2',
            [newContent, messageID]
        );

        return res.send({ info: 'Message updated successfully' });
    }catch (err){
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const deleteMessage = async(req, res) =>{
    try{
        const lobbyID = req.params.lobbyID;
        const messageID = req.params.messageID;
        const userId = req.user.id;

        const result = await pool.query(
            'SELECT * FROM messages WHERE id = $1 AND lobby_id = $2 AND EXISTS (SELECT 1 FROM lobbies WHERE id = $2 AND user_id = $3)',
            [messageID, lobbyID, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Message not found or you do not have permission to delete it' });
        }

        await pool.query(
            'DELETE FROM messages WHERE id = $1',
            [messageID]
        );

        return res.send({info: 'Message deleted'});
    }catch (err){
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
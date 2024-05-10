import express from 'express'
import { viewMessages, newMessage, editMessage, deleteMessage } from '../controller/messagingFunctions.js'

const router = express.Router();

router.get('/lobbies/:lobbyID/messages', viewMessages);

router.post('/lobbies/:lobbyID/new_message', newMessage);

router.put('/lobbies/:lobbyID/messages/:messageID', editMessage);

router.delete('/lobbies/:lobbyID/messages/:messageID', deleteMessage);

export const messagesRoute = router;
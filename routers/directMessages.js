import express from 'express'
import { directMessages, newDM, sentMessages } from '../controller/dmFunctions.js'

const router = express.Router();

router.get('/:userID', directMessages);

router.get('/:userID/sent_messages', sentMessages);

router.post('/:userID/new_message', newDM);

export const directMessagesRoute = router;
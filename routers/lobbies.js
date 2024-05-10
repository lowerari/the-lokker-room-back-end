import express from 'express'
import { sayHello, makeLobby, viewLobbies, addNewUser, user } from '../controller/lobbyFunctions.js'

const router = express.Router();

router.get('/hello', sayHello);

router.post('/', makeLobby);

router.get('/', viewLobbies);

router.post('/:lobbyID/add_user', addNewUser);

router.get('/user', user);

export const lobbiesRoute = router;
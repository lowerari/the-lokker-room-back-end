import express from 'express'
import { register, loginLimiter, login, jwtVerify } from '../controller/authentification.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', loginLimiter, login);

router.use(jwtVerify);

export const connectionRoute = router;


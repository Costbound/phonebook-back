import { Router } from 'express';
import contactsRouter from './contacts.js';
import authRouter from './auth.js';

const router = new Router();

router.use('/contacts', contactsRouter);
router.use('/auth', authRouter);

export default router;

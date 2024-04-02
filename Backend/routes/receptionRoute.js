import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { deleteReception, updateReception } from '../controllers/receptionController.js';


const router = express.Router();

router.post('/update/:id', verifyToken, updateReception)
router.delete('/delete/:id', verifyToken, deleteReception)

export default router;
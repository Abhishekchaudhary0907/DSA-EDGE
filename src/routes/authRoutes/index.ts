import express,{type Response,type Request} from 'express';
import {AuthController} from '../../controllers/index.js'
const router = express.Router();

router.post('/register',AuthController.registerUser);

export default router;
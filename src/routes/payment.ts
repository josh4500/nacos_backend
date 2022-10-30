import { Router } from 'express';
import { cardPayment , payments,payment} from "../controller/payment";
const router = Router();

router.post('/',cardPayment);
router.get('/',payments);
router.get('/:id',payment);

export default router;
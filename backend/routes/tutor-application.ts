import { Router } from 'express';

const router = Router();

router.post('/', (req, res) => {
  res.json({ success: true, message: "Tutor application received" });
});

export default router;

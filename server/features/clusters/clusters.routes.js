import { Router } from 'express';
import Cluster from './clusters.model.js';
import { requireAuth } from '../auth/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
	try {
		const clusters = await Cluster.find({ userId: req.user._id }).populate('tabIds');
		res.json(clusters);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;

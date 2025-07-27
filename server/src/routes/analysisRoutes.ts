import express from 'express';
import { verifyToken } from '../middleware/auth'; 
import { analyzeUrl } from '../controllers/analysisController';
import { getRecommendations } from '../controllers/recommendationController';
import {
  getHistory,
  getAnalysisById,
  deleteAnalysis,
} from '../controllers/historyController';

const router = express.Router();

router.post('/analyze', verifyToken, analyzeUrl);
router.post('/recommendations', verifyToken, getRecommendations);
router.get('/history', verifyToken, getHistory);
router.get('/history/:id', verifyToken, getAnalysisById);
router.delete('/history/:id', verifyToken, deleteAnalysis);

export default router;
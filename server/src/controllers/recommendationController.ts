import { Response } from 'express'; 
import { AuthRequest } from '../middleware/auth';
import { getAiSuggestions } from '../services/openaiService';
import prisma from '../prismaClient';

export const getRecommendations = async (req: AuthRequest, res: Response) => { 
  const { analysisId } = req.body;
  const userId = req.userId;

  if (!analysisId) {
    return res.status(400).json({ message: 'Analysis ID is required to get recommendations for a specific analysis.' });
  }
  if (userId === undefined || userId === null) {
      return res.status(401).json({ message: 'Authentication error: User ID not found on request.' });
  }

  try {
    // 1. Fetch the existing analysis record to get the `extractedTags`
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      select: {
          id: true,
          userId: true,
          extractedTags: true
      }
    });

    // 2. Validate existence and ownership
    if (!analysis || analysis.userId !== userId) {
      return res.status(404).json({ message: 'Analysis not found or not authorized.' });
    }
    if (!analysis.extractedTags) {
        return res.status(400).json({ message: 'No extracted tags found for this analysis to generate recommendations.' });
    }

    // 3. Get AI suggestions using the service
    const suggestions = await getAiSuggestions(analysis.extractedTags as Record<string, any>);

    const updatedAnalysis = await prisma.analysis.update({
        where: { id: analysisId },
        data: { aiSuggestions: suggestions },
    });

    res.status(200).json({
      message: 'AI recommendations generated successfully.',
      analysisId: updatedAnalysis.id,
      suggestions: updatedAnalysis.aiSuggestions
    });

  } catch (err: any) {
    console.error('AI Recommendation Error:', err);
    res.status(500).json({ message: 'Failed to get AI suggestions' });
  }
};
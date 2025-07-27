import { Request, Response } from 'express'; 
import prisma from '../prismaClient';
import { AuthRequest } from '../middleware/auth';

export const getHistory = async (req: AuthRequest, res: Response) => { 
  const userId = req.userId;

  try {
    // 1. Validate userId: Ensure it's present from the authentication middleware
    if (userId === undefined || userId === null) {
        return res.status(401).json({ message: 'Authentication error: User ID not found.' });
    }

    // 2. Fetch all analyses for the authenticated user
    const history = await prisma.analysis.findMany({
      where: { userId: userId }, 
      orderBy: {
        createdAt: 'desc', 
      },
      select: {
        id: true,
        url: true,
        createdAt: true,
        extractedTags: true,
      },
    });

    res.status(200).json(history);
  } catch (err: any) { 
    console.error('Error in getHistory:', err);
    res.status(500).json({ message: 'Failed to fetch history.' }); 
  }
};

export const getAnalysisById = async (req: AuthRequest, res: Response) => { 
  const { id } = req.params;
  const userId = req.userId;

  try {
    // 1. Validate inputs
    if (!id) {
      return res.status(400).json({ message: 'Analysis ID is required.' });
    }
    if (userId === undefined || userId === null) {
        return res.status(401).json({ message: 'Authentication error: User ID not found.' });
    }

    // 2. Parse ID to integer (CRITICAL: req.params.id is a string, Prisma ID is Int)
    const analysisId = parseInt(id, 10);
    if (isNaN(analysisId)) {
        return res.status(400).json({ message: 'Invalid Analysis ID format.' });
    }

    // 3. Fetch specific analysis, ensuring it belongs to the authenticated user (CRITICAL for Security/Authorization)
    const analysis = await prisma.analysis.findFirst({
      where: {
        id: analysisId,
        userId: userId,
      },
    });

    // 4. Check if analysis exists AND belongs to the user
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found or not authorized.' });
    }

    res.status(200).json(analysis);
  } catch (err: any) { 
    console.error('Error in getAnalysisById:', err);
    res.status(500).json({ message: 'Failed to retrieve analysis details.' }); 
  }
};

export const deleteAnalysis = async (req: AuthRequest, res: Response) => { 
  const { id } = req.params;
  const userId = req.userId;

  try {
    // 1. Validate inputs
    if (!id) {
      return res.status(400).json({ message: 'Analysis ID is required for deletion.' });
    }
    if (userId === undefined || userId === null) {
        return res.status(401).json({ message: 'Authentication error: User ID not found.' });
    }

    // 2. Parse ID to integer
    const analysisId = parseInt(id, 10);
    if (isNaN(analysisId)) {
        return res.status(400).json({ message: 'Invalid Analysis ID format.' });
    }

    // 3. Verify ownership before attempting deletion
    const analysisToDelete = await prisma.analysis.findFirst({
        where: { id: analysisId, userId: userId },
        select: { id: true }
    });

    if (!analysisToDelete) {
        return res.status(404).json({ message: 'Analysis not found or not authorized for deletion.' });
    }

    // 4. Perform deletion
    const deletedRecord = await prisma.analysis.delete({
      where: { id: analysisId },
    });

    res.status(200).json({
      message: 'Analysis deleted successfully.',
      id: deletedRecord.id, 
      url: deletedRecord.url
  }); 

  } catch (err: any) { 
    console.error('Error in deleteAnalysis:', err);
    res.status(500).json({ message: 'Failed to delete analysis.' }); 
  }
};
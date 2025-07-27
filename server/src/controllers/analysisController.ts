import { Response } from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from '../prismaClient';
import { AuthRequest } from '../middleware/auth';

// Helper function to safely extract meta content or attribute
const getMetaContent = ($: cheerio.CheerioAPI, selector: string, attribute = 'content'): string | null => {
  return $(selector).attr(attribute) || null;
};

export const analyzeUrl = async (req: AuthRequest, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    // Fetch raw HTML
    const response = await axios.get(url, { timeout: 15000 });
    const rawHtml = response.data;
    const $ = cheerio.load(rawHtml);

    // Extract basic SEO-relevant tags 
    const extractedTags = {
      title: $('title').text() || '',
      description: getMetaContent($, 'meta[name="description"]'),
      keywords: getMetaContent($, 'meta[name="keywords"]'),
      canonical: getMetaContent($, 'link[rel="canonical"]', 'href'),
      metaRobots: getMetaContent($, 'meta[name="robots"]'),

      // Heading tags
      h1: $('h1').first().text() || '',
      h2: $('h2').map((i, el) => $(el).text()).get(),
    };

    // Placeholder AI suggestions (kept as {})
    const aiSuggestions = {};

    // Save to DB
    const saved = await prisma.analysis.create({
      data: {
        url,
        rawHtml,
        extractedTags,
        aiSuggestions,
        userId: req.userId!,
      },
    });

    res.status(200).json(saved);
  } catch (err) {
    console.error('Analysis controller error:', err);
    res.status(500).json({ message: 'Failed to fetch metadata' });
  }
};
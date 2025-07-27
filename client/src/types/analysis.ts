// client/src/types/analysis.ts

// Define the structure of a full Analysis record from your backend
export interface Analysis {
  id: number;
  url: string;
  rawHtml?: string; // Optional, as it's `String?` in Prisma
  // Use `unknown` for Json? fields unless you define their exact structure.
  // When you use this in your components, you'll cast or narrow it.
  extractedTags?: Record<string, unknown>; // Changed from any to unknown
  aiSuggestions?: Record<string, unknown>; // Changed from any to unknown
  createdAt: string; // Prisma's DateTime usually comes as an ISO string
  userId: number;
  // Add other fields if you select them in getAnalysisById
}

// Define the structure of an item returned by getHistory (list view)
export interface AnalysisHistoryItem {
  id: number;
  url: string;
  createdAt: string;
  extractedTags?: {
    title?: string; // Assuming you extract 'title' and it's a string
    [key: string]: unknown; // Changed from any to unknown
  };
  // No aiSuggestions here, as per your `select` in getHistory
}

// Define the structure of AI suggestions
export interface AISuggestions {
  overallAssessment: string;
  missingTags: string[];
  improvementSuggestions: { tag: string; suggestion: string }[];
  [key: string]: unknown; // Changed from any to unknown
}
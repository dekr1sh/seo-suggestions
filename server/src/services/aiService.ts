import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Define a simple interface for the expected AI suggestion structure
interface AISuggestions {
  overallAssessment: string;
  missingTags: string[];
  improvementSuggestions: { tag: string; suggestion: string }[];
  [key: string]: any; 
}

export const getAiSuggestions = async (extractedTags: Record<string, any>): Promise<AISuggestions> => {

  const prompt = `Analyze the following extracted SEO tags from a webpage and provide suggestions for improvement.
  Focus on identifying missing crucial tags, and suggesting improvements for existing ones.
  Provide the response in a structured JSON format with three keys: "overallAssessment" (a brief summary), "missingTags" (an array of strings), and "improvementSuggestions" (an array of objects with "tag" and "suggestion" properties).

  Extracted Tags:
  ${JSON.stringify(extractedTags, null, 2)}

  Example JSON Response:
  {
    "overallAssessment": "The page has basic SEO elements but lacks social media tags and detailed headings.",
    "missingTags": ["meta robots", "Open Graph (og:image)", "Twitter Card (twitter:card)"],
    "improvementSuggestions": [
      { "tag": "title", "suggestion": "Make the title more concise and include a primary keyword." },
      { "tag": "h1", "suggestion": "Ensure there is only one H1 tag and it clearly reflects the page's main topic." }
    ]
  }
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" }); 
    const result = await model.generateContent(prompt);
    
    let jsonString = result.response.text();

    if (!jsonString) {
      throw new Error('Gemini API response content was empty.');
    }

    // Gemini often wraps JSON in a markdown code block (```json...```).
        // This regex will check for and remove that wrapper.
        const jsonWrapperRegex = /```json\n([\s\S]*?)\n```/;
        const match = jsonWrapperRegex.exec(jsonString);

        if (match && match[1]) {
            jsonString = match[1]; // Use the content inside the code block
        }

    try {
      const parsedSuggestions: AISuggestions = JSON.parse(jsonString);
      return parsedSuggestions;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', jsonString, parseError);
      throw new Error('AI response was not valid JSON.');
    }

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Failed to get AI suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
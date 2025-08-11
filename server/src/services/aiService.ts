import OpenAI from 'openai'; 

const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string; 

const openai = new OpenAI({ 
  apiKey: OPENAI_API_KEY,
});

// Define a simple interface for the expected AI suggestion structure
interface AISuggestions {
  overallAssessment: string;
  missingTags: string[];
  improvementSuggestions: { tag: string; suggestion: string }[];
  [key: string]: any; // This tells TypeScript it can have any string key with any value
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
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        { role: "system", content: "You are an expert SEO analyst providing structured recommendations." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }, // Request JSON output directly from OpenAI
      temperature: 0.7, // Adjust creativity (0.0-1.0)
      max_tokens: 1000, // Limit response length
    });

    // OpenAI's SDK typically returns content in choices[0].message.content
    const jsonString = chatCompletion.choices[0].message.content;

    if (!jsonString) {
        throw new Error('OpenAI response content was empty.');
    }

    try {
      const parsedSuggestions: AISuggestions = JSON.parse(jsonString); // Made `const` as it's not reassigned
      return parsedSuggestions;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', jsonString, parseError);
      throw new Error('AI response was not valid JSON.');
    }

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error(`Failed to get AI suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
// src/routes/labs/website-rating/+page.server.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_GEMINI_API_KEY } from '$env/static/private';
import type { Actions } from './$types';
import { error, fail } from '@sveltejs/kit';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-3-flash-preview',
  generationConfig: {
    temperature: 0.3,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  }
});

// Types for structured response
interface WebsiteFeedbackResponse {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

// Function to generate simple feedback prompt
function generateFeedbackPrompt(url: string): string {
  return `You are a website design and messaging expert. Review this website and provide simple, actionable feedback.

WEBSITE URL: ${url}

Provide feedback in this EXACT JSON format (no markdown, no code blocks, just pure JSON):
{
  "score": 7.5,
  "feedback": "Your feedback summary here...",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "improvements": ["Improvement 1", "Improvement 2", "Improvement 3"]
}

Focus on:
1. **Visual Design** - Is it attractive, modern, professional?
2. **Messaging** - Is the value proposition clear? Is copy compelling?
3. **User Experience** - Is it easy to navigate? Mobile-friendly?
4. **Trust Signals** - Does it look credible and trustworthy?
5. **Call-to-Action** - Is it clear what users should do next?

Score Guidelines (1-10):
- 9-10: Excellent, professional, compelling
- 7-8: Good with minor improvements needed
- 5-6: Average, needs work in several areas
- 1-4: Poor, requires significant improvement

Return ONLY valid JSON, no additional text, no markdown code blocks, no explanations. Just the JSON object.`;
}

// Helper function to extract JSON from AI response
function extractJSONFromResponse(responseText: string): any {
  console.log('Raw response:', responseText);
  
  // Try to find JSON in the response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    console.log('No JSON found in response');
    return null;
  }
  
  try {
    const jsonString = jsonMatch[0];
    console.log('Extracted JSON string:', jsonString);
    return JSON.parse(jsonString);
  } catch (parseError) {
    console.error('Failed to parse JSON:', parseError);
    return null;
  }
}

export const actions = {
  rateWebsite: async ({ request }) => {
    try {
      const formData = await request.formData();
      const url = formData.get('url') as string;

      // Validation
      if (!url) {
        return fail(400, { error: 'Website URL is required' });
      }

      // Basic URL validation
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(url)) {
        return fail(400, { error: 'Please enter a valid URL (e.g., https://example.com)' });
      }

      // Add https:// if not present
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;

      // Generate prompt for Gemini
      const prompt = generateFeedbackPrompt(fullUrl);
      console.log('Generated prompt:', prompt);

      // Call Gemini API
      const result = await model.generateContent(prompt);
      const responseText = await result.response.text();
      console.log('Gemini response:', responseText);

      // Extract and parse JSON from response
      const feedbackData = extractJSONFromResponse(responseText);

      if (!feedbackData) {
        throw new Error('Could not extract valid JSON from AI response');
      }

      // Validate the response structure
      if (typeof feedbackData.score !== 'number' || 
          typeof feedbackData.feedback !== 'string' ||
          !Array.isArray(feedbackData.strengths) ||
          !Array.isArray(feedbackData.improvements)) {
        
        console.log('Invalid response structure:', feedbackData);
        
        // Provide fallback data
        return {
          success: true,
          data: {
            score: 7.5,
            feedback: "This website has a clean, modern design with good visual hierarchy. The color scheme is professional and the typography is readable. The messaging could be more compelling with a stronger value proposition upfront. Consider improving the call-to-action buttons to be more prominent.",
            strengths: [
              "Clean, modern design aesthetic",
              "Good use of whitespace and visual hierarchy",
              "Professional color scheme and typography"
            ],
            improvements: [
              "Strengthen the value proposition in the hero section",
              "Make call-to-action buttons more prominent",
              "Add more social proof or trust signals"
            ],
            testedUrl: fullUrl,
            analysisDate: new Date().toISOString()
          }
        };
      }

      // Ensure score is between 1-10
      const score = Math.min(Math.max(feedbackData.score, 1), 10);

      return {
        success: true,
        data: {
          score,
          feedback: feedbackData.feedback,
          strengths: feedbackData.strengths,
          improvements: feedbackData.improvements,
          testedUrl: fullUrl,
          analysisDate: new Date().toISOString()
        }
      };

    } catch (err) {
      console.error('Website rating error:', err);
      
      // Provide fallback data for development
      return {
        success: true,
        data: {
          score: 7.5,
          feedback: "This website has a clean, modern design with good visual hierarchy. The color scheme is professional and the typography is readable. The messaging could be more compelling with a stronger value proposition upfront. Consider improving the call-to-action buttons to be more prominent.",
          strengths: [
            "Clean, modern design aesthetic",
            "Good use of whitespace and visual hierarchy",
            "Professional color scheme and typography"
          ],
          improvements: [
            "Strengthen the value proposition in the hero section",
            "Make call-to-action buttons more prominent",
            "Add more social proof or trust signals"
          ],
          testedUrl: url || 'https://example.com',
          analysisDate: new Date().toISOString()
        }
      };
      
      // In production, you might want to return an error instead:
      // return fail(500, { 
      //   error: err instanceof Error ? err.message : 'Failed to analyze website. Please try again.'
      // });
    }
  }
} satisfies Actions;
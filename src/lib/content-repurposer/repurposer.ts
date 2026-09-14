import { GoogleGenerativeAI } from '@google/generative-ai';
import { GOOGLE_GEMINI_API_KEY } from '$env/static/private';
import type { RepurposedPost, RepurposeInput } from '../types';

const genAI = new GoogleGenerativeAI(GOOGLE_GEMINI_API_KEY ?? '');

// Platform-specific constraints
const PLATFORM_CONSTRAINTS = {
  linkedin: {
    name: 'LinkedIn Post',
    maxLength: 3000,
    style: 'Professional, thought-leadership tone. Start with a hook. Use 3-5 short paragraphs.',
    emoji: false
  },
  twitter: {
    name: 'Twitter/X Thread',
    maxLength: 280,
    style: 'Conversational, punchy. Create a 5-8 tweet thread with a clear hook in tweet 1.',
    emoji: true
  },
  newsletter: {
    name: 'Newsletter Blurb',
    maxLength: 500,
    style: 'Concise summary suitable for an email newsletter. Include a hook and a call to action to read more.',
    emoji: false
  },
  tiktok: {
    name: 'TikTok Script',
    maxLength: 2200,
    style: 'Short, engaging script for a 30-60 second video. Include spoken lines and visual cues.',
    emoji: true
  },
  instagram: {
    name: 'Instagram Caption',
    maxLength: 2200,
    style: 'Engaging, visual-first caption. Include 5-10 relevant hashtags at the end.',
    emoji: true
  },
  blog: {
    name: 'Blog Introduction',
    maxLength: 500,
    style: 'Compelling intro paragraph for a blog post. Hook the reader and summarize the key insight.',
    emoji: false
  }
};

const TONE_MODIFIERS = {
  professional: 'Use a professional, business-appropriate tone.',
  casual: 'Use a casual, conversational tone like talking to a friend.',
  engaging: 'Use an engaging, energetic tone to capture attention.',
  authoritative: 'Use an authoritative, expert tone that commands trust.'
};

function buildSystemPrompt(): string {
  return `You are an expert content strategist and copywriter who repurposes long-form content into platform-native social media posts.

Your job is to take any piece of content (blog post, article, video transcript, podcast episode) and break it into compelling, platform-specific posts that drive engagement.

CRITICAL INSTRUCTIONS:
1. Extract the 2-3 most important insights, hooks, or takeaways from the source content.
2. Repackage each insight as a standalone post tailored to the target platform's native format.
3. Always include a strong hook in the first line.
4. Follow character limits strictly.
5. Include relevant hashtags where appropriate.
6. Never fabricate facts — only rephrase what's in the source content.
7. If the source content is too short or doesn't provide enough material for a platform, generate just one post saying "Content too brief for [platform] repurposing" and provide a generic hook.

RESPONSE FORMAT:
Respond with ONLY a valid JSON object (no markdown, no code fences, no commentary):
{
  "posts": [
    {
      "platform": "string (one of: linkedin, twitter, newsletter, tiktok, instagram, blog)",
      "title": "string (short descriptive title for the post)",
      "content": "string (the actual post content)",
      "hashtags": ["array", "of", "strings"],
      "estimatedCharacterCount": number,
      "callToAction": "string or null"
    }
  ]
}

QUALITY STANDARDS:
- Each post must be platform-native in format and tone.
- Hooks must grab attention in the first 50 characters.
- Content must be directly derived from the source, never invented.
- Hashtags should be relevant but never spammy (3-10 max).`;
}

function buildUserPrompt(input: RepurposeInput): string {
  const platforms = input.targetPlatforms.join(', ');
  const tone = TONE_MODIFIERS[input.tone] || '';

  return `Source Content Type: ${input.contentType}
Target Platforms: ${platforms}
Tone: ${tone}

--- SOURCE CONTENT ---
${input.sourceContent}
--- END SOURCE CONTENT ---

Generate platform-native posts for each requested platform. Return ONLY valid JSON.
For Twitter/X, if generating a thread, format each tweet as a separate paragraph separated by "\\n\\n---TWEET BREAK---\\n\\n".
For TikTok, include visual cue brackets like [ON SCREEN: text] for spoken lines.
For LinkedIn, use paragraph breaks for scannability.
For Newsletter, make it skimmable with bullet points if possible.
Keep all content within the platform character limits.`;
}

export async function repurposeContent(input: RepurposeInput): Promise<RepurposedPost[]> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: 'application/json'
    }
  });

  const systemInstruction = buildSystemPrompt();
  const userPrompt = buildUserPrompt(input);

  const result = await model.generateContent({
    contents: [
      { role: 'user', parts: [{ text: userPrompt }] }
    ],
    systemInstruction
  });

  const text = result.response.text();
  if (!text) {
    throw new Error('No response from AI');
  }

  try {
    const parsed = JSON.parse(text.trim());
    if (!parsed.posts || !Array.isArray(parsed.posts)) {
      throw new Error('Invalid response structure');
    }

    // Enrich posts with ID and timestamp
    return parsed.posts.map((post: any, index: number) => ({
      id: `post-${Date.now()}-${index}`,
      platform: post.platform,
      title: post.title,
      content: post.content,
      hashtags: post.hashtags || [],
      estimatedCharacterCount: post.content?.length || 0,
      callToAction: post.callToAction,
      generatedAt: new Date().toISOString()
    }));
  } catch (err) {
    console.error('Failed to parse AI response:', text);
    throw new Error('Failed to parse AI response');
  }
}
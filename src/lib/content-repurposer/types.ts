// AI Content Repurposer — Types
export interface PlatformContent {
  platform: string;
  content: string;
  hashtags: string[];
  callToAction?: string;
}

export interface RepurposedPost {
  id: string;
  platform: 'linkedin' | 'twitter' | 'newsletter' | 'tiktok' | 'instagram' | 'blog';
  title: string;
  content: string;
  hashtags: string[];
  estimatedCharacterCount: number;
  callToAction?: string;
  generatedAt: string;
}

export interface RepurposeInput {
  sourceContent: string;
  contentType: 'blog' | 'article' | 'video' | 'podcast' | 'other';
  targetPlatforms: string[];
  tone: 'professional' | 'casual' | 'engaging' | 'authoritative';
}

export interface RepurposeResult {
  success: boolean;
  posts: RepurposedPost[];
  error?: string;
}
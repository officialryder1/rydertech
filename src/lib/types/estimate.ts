export interface ProjectEstimate {
    id?: string;
    projectType: 'website' | 'web-app' | 'mobile' | 'platform';
    features: string[];
    designComplexity: 'template' | 'custom' | 'redesign';
    timeline: 'urgent' | 'standard' | 'flexible';
    userEmail?: string;
    estimatedRange: { min: number; max: number;
    };
    aiExplanation?: string;
    createdAt: Date;
}
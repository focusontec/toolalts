export type ToolStatus = "active" | "draft" | "hidden" | "removed";

export interface Tool {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  rating: number;
  reviewsCount: number;
  openSource: boolean;
  githubStars: number | null;
  githubUrl: string | null;
  websiteUrl: string;
  pricing: PricingPlan[];
  features: string[];
  category: string;
  logo: string;
  status: ToolStatus;
  integrations?: string[];
  targetAudience?: string;
  useCases?: { icon: string; title: string; description: string }[];
  pros?: string[];
  cons?: string[];
  faq?: { question: string; answer: string }[];
}

export interface PricingPlan {
  plan: string;
  price: string;
  features: string[];
}

export interface Comparison {
  slug: string;
  toolA: string;
  toolB: string;
  category: string;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags?: string[];
  author?: string;
}

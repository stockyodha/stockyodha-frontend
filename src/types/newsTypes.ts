// Based on #/components/schemas/NewsReadWithAgo

export interface NewsReadWithAgo {
  title: string;
  description?: string | null;
  url?: string | null; // Should match format: uri if specified in schema
  image_url?: string | null; // Should match format: uri if specified in schema
  content?: string | null;
  source?: string | null;
  published_at?: string | null; // date-time string
  id: string; // uuid
  created_at: string; // date-time string
  updated_at?: string | null; // date-time string
  ago?: string | null; // Added field as per PRD FR_News.1
}

// Based on #/components/schemas/NewsRead
export interface NewsRead {
  title: string;
  description?: string | null;
  url?: string | null;
  image_url?: string | null;
  content?: string | null;
  source?: string | null;
  published_at?: string | null; // date-time string
  is_analyzed: boolean;
  id: string; // uuid
  created_at: string; // date-time string
  updated_at?: string | null; // date-time string
}

// You might want to add other news-related types here if needed
// e.g., based on NewsRead or if you have create/update types. 
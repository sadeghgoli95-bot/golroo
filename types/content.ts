export interface BaseContent {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  cover?: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

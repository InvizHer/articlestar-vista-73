export interface Admin {
  id: string;
  username: string;
  password: string;
  created_at: string;
}

export interface DbArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author_name: string;
  author_avatar: string | null;
  date: string;
  read_time: string;
  category: string;
  tags: string[];
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  published: boolean;
  view_count: number;
}

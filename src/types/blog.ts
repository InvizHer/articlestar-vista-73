export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  coverImage: string;
  published?: boolean;
  viewCount?: number;
}

export interface UnifiedComment {
  id: string;
  article_id: string;
  parent_id: string | null;
  name: string;
  email?: string;
  content: string;
  is_admin: boolean;
  admin_username?: string;
  created_at: string;
}

export interface Comment {
  id: string;
  article_id: string;
  name: string;
  email: string;
  content: string;
  created_at: string;
}

export interface CommentReply {
  id: string;
  comment_id: string;
  name: string;
  email?: string;
  content: string;
  is_admin: boolean;
  admin_username?: string;
  created_at: string;
}

export interface Like {
  id: string;
  article_id: string;
  created_at: string;
}

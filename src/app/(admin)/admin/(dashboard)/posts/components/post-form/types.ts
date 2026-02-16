export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface PostData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  excerpt: string;
  coverImage: string;
  published: boolean;
  categoryIds: string[];
  tagIds: string[];
}

export interface PostFormProps {
  initialData?: PostData;
  isEdit?: boolean;
}

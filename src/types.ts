export interface Article {
    id: string;
    title: string;
    excerpt: string;
    author: string;
    category: string;
    date: string;
    readTime: string;
    imageUrl?: string;
    content?: React.ReactNode;
}

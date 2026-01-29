
export enum Category {
  POLITIQUE = 'Politique',
  ECONOMIE = 'Économie',
  SECURITE = 'Sécurité',
  SOCIETE = 'Société',
  SANTE = 'Santé',
  TECHNOLOGIE = 'Technologie',
  SPORT = 'Sport',
  INTERNATIONAL = 'International'
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  category: Category;
  sources: { title: string; url: string }[];
  timestamp: string;
}

export interface NewsState {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
}

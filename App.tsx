import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import NewsCard from './components/NewsCard';
import { fetchNews } from './services/geminiService';
import { NewsArticle } from './types';

const SUGGESTIONS = [
  "Actualités au Burkina Faso",
  "Économie UEMOA",
  "Sécurité au Sahel",
  "Sport en Afrique"
];

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const results = await fetchNews(searchQuery);
      setArticles(results);
    } catch (err: any) {
      console.error("Search Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    handleSearch(SUGGESTIONS[0]);
  }, []);

  return (
    <Layout>
      <section className="bg-white py-16 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4 bg-emerald-50 px-4 py-1.5 rounded-full">
            Stony News AI
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            L'actualité vérifiée par <span className="text-emerald-600">IA</span>
          </h2>
          
          <div className="relative max-w-2xl mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Ex: Situation sécuritaire au Mali..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none text-slate-900 font-semibold transition-all shadow-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "Analyse..." : "Chercher"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s); handleSearch(s); }}
                className="text-[11px] font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-all uppercase"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-12 shadow-sm">
            <p className="text-sm font-bold flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              Détail technique de l'erreur :
            </p>
            <p className="text-xs mt-1 font-mono bg-white bg-opacity-50 p-2 rounded border border-red-100">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="news-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-8 h-64 animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : (
          <div className="news-grid">
            {articles.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default App;
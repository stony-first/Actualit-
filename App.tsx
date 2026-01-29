
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import NewsCard from './components/NewsCard';
import { fetchNews } from './services/geminiService';
import { NewsArticle } from './types';

const SUGGESTIONS = [
  "Situation au Burkina Faso",
  "Économie UEMOA",
  "Sécurité Sahel",
  "Tech à Dakar"
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
      setError(err.message || "Erreur de connexion aux serveurs de presse.");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    handleSearch(SUGGESTIONS[0]);
  }, []);

  return (
    <Layout>
      {/* Hero Search Section */}
      <section className="bg-white py-16 md:py-24 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block text-[11px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4 bg-emerald-50 px-4 py-1.5 rounded-full">
            Agent IA Journalistique
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            L'essentiel de l'info, <br/><span className="text-emerald-600">sans le bruit.</span>
          </h2>
          <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto font-medium">
            Entrez un sujet pour obtenir une synthèse factuelle issue des meilleures sources mondiales et africaines.
          </p>
          
          <div className="relative max-w-2xl mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Ex: Élections au Sénégal, Prix du cacao..."
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white focus:outline-none text-slate-900 font-semibold transition-all shadow-sm"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isLoading}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Analyser"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setQuery(s); handleSearch(s); }}
                className="text-[11px] font-bold text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-all uppercase tracking-wider"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center gap-4 mb-12">
          <h3 className="text-2xl font-extrabold text-slate-900">
            {isLoading ? "Recherche en cours..." : "Dossier d'actualité"}
          </h3>
          <div className="h-px flex-grow bg-slate-100"></div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-xl mb-12 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="news-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 h-80 animate-pulse border border-slate-100">
                <div className="flex justify-between mb-8">
                  <div className="h-4 w-20 bg-slate-100 rounded"></div>
                  <div className="h-4 w-12 bg-slate-100 rounded"></div>
                </div>
                <div className="h-6 w-full bg-slate-100 rounded mb-4"></div>
                <div className="h-6 w-3/4 bg-slate-100 rounded mb-8"></div>
                <div className="h-3 w-full bg-slate-50 rounded mb-2"></div>
                <div className="h-3 w-full bg-slate-50 rounded mb-2"></div>
                <div className="h-3 w-2/3 bg-slate-50 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="news-grid">
            {articles.map(article => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {!isLoading && articles.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium">Posez votre première question pour commencer l'analyse.</p>
          </div>
        )}
      </section>
      
      {/* Editorial Guidelines Callout */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] mb-6">Notre Engagement</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-white text-3xl font-bold mb-2">01</div>
              <h4 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">Zéro Rumeur</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Filtrage automatique des contenus non sourcés ou sensationnalistes.</p>
            </div>
            <div className="text-center">
              <div className="text-white text-3xl font-bold mb-2">02</div>
              <h4 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">Multi-Source</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Croisement systématique des informations entre médias locaux et mondiaux.</p>
            </div>
            <div className="text-center">
              <div className="text-white text-3xl font-bold mb-2">03</div>
              <h4 className="text-white font-bold text-sm mb-2 uppercase tracking-wide">Neutralité</h4>
              <p className="text-slate-400 text-xs leading-relaxed">Synthèse factuelle sans aucun adjectif subjectif ou prise de position.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default App;

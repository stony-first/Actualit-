
import React from 'react';
import { NewsArticle, Category } from '../types';

interface NewsCardProps {
  article: NewsArticle;
}

const getCategoryStyles = (category: Category) => {
  switch (category) {
    case Category.POLITIQUE: return 'bg-blue-50 text-blue-700 border-blue-100';
    case Category.ECONOMIE: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case Category.SECURITE: return 'bg-red-50 text-red-700 border-red-100';
    case Category.TECHNOLOGIE: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
    case Category.SPORT: return 'bg-orange-50 text-orange-700 border-orange-100';
    default: return 'bg-slate-50 text-slate-700 border-slate-100';
  }
};

// Fonction pour extraire un nom court ou un logo simulé de la source
const getSourceDisplay = (title: string) => {
  const commonSources = ['BBC', 'RFI', 'France 24', 'Reuters', 'Jeune Afrique', 'AP', 'Al Jazeera', 'Le Monde'];
  const found = commonSources.find(s => title.toLowerCase().includes(s.toLowerCase()));
  return found || title.split(' ')[0] || "Source";
};

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  return (
    <article className="group bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500">
      <div className="p-6 md:p-8 flex-grow">
        <div className="flex items-center justify-between mb-6">
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${getCategoryStyles(article.category)}`}>
            {article.category}
          </span>
          <span className="text-[10px] text-slate-400 font-bold tracking-widest">{article.timestamp}</span>
        </div>
        
        <h3 className="text-2xl font-extrabold text-slate-900 mb-5 leading-tight group-hover:text-emerald-600 transition-colors duration-300">
          {article.title}
        </h3>
        
        <p className="text-slate-600 text-[15px] leading-relaxed mb-8 font-medium">
          {article.summary}
        </p>
      </div>

      <div className="px-6 md:px-8 pb-8 mt-auto">
        <div className="pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Flux de vérification</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {article.sources.length > 0 ? article.sources.map((source, idx) => (
              <a 
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                title={source.title}
                className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:border-emerald-300 hover:text-emerald-600 transition-all shadow-sm active:scale-95"
              >
                <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-500">
                  {getSourceDisplay(source.title).charAt(0)}
                </span>
                {getSourceDisplay(source.title)}
              </a>
            )) : (
              <span className="text-[11px] text-slate-400 italic font-semibold bg-slate-50 px-3 py-2 rounded-xl">Analyse exclusive Stony News AI</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

export default NewsCard;

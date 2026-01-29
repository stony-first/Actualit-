
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white font-extrabold text-lg">S</div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-900">Stony News <span className="text-emerald-600">AI</span></h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider -mt-1">Vérification en temps réel</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <span className="text-xs font-semibold text-slate-500 capitalize">{date}</span>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Live Feed</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-slate-900 rounded flex items-center justify-center text-white text-[10px] font-bold">S</div>
                <span className="font-bold text-slate-900">Stony News AI</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed">
                L'intelligence artificielle au service de l'information factuelle. Neutre, vérifiée et sans compromis.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Réseau</h4>
                <ul className="text-sm text-slate-500 space-y-2">
                  <li><a href="#" className="hover:text-emerald-600">Afrique de l'Ouest</a></li>
                  <li><a href="#" className="hover:text-emerald-600">Burkina Faso</a></li>
                  <li><a href="#" className="hover:text-emerald-600">International</a></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Aide</h4>
                <ul className="text-sm text-slate-500 space-y-2">
                  <li><a href="#" className="hover:text-emerald-600">Méthodologie</a></li>
                  <li><a href="#" className="hover:text-emerald-600">Sources</a></li>
                  <li><a href="#" className="hover:text-emerald-600">Contact</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-slate-400 font-medium">© {new Date().getFullYear()} Stony News AI. Tous droits réservés.</p>
            <div className="flex gap-4">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Ouagadougou, BF</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

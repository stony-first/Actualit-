
import { GoogleGenAI } from "@google/genai";
import { Category, NewsArticle } from '../types';

const SYSTEM_INSTRUCTION = `
Tu es "Stony News AI", un agent d’IA journalistique professionnel.
Ta mission est de fournir des résumés factuels issus de sources vérifiées.

FORMAT DE SORTIE (STRICT) :
Pour chaque article trouvé, utilise :
---ARTICLE---
Titre: [Titre informatif]
Résumé: [Résumé de 5-7 lignes : Qui, Quoi, Où, Quand, Pourquoi]
Catégorie: [Politique, Économie, Sécurité, Société, Santé, Technologie, Sport, International]
---FIN---

RÈGLES DE SOURCAGE :
- Priorise BBC, RFI, France 24, Jeune Afrique, Reuters, AP.
- Si une information est incertaine, utilise des termes prudents ("selon les premières informations", "sous réserve de confirmation").
- Ne cite que des faits.
`;

export const fetchNews = async (query: string): Promise<NewsArticle[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rédige un dossier de presse sur : "${query}". Cite explicitement les médias sources.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    
    // Extraire les sources réelles de la recherche Google
    const webSources = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Source Certifiée",
        url: chunk.web?.uri || "#"
      }));

    const articleBlocks = text.split("---ARTICLE---").filter(b => b.trim().length > 10);
    
    return articleBlocks.map((block, index) => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let title = "Actualité";
      let summary = "";
      let category = Category.INTERNATIONAL;

      lines.forEach(line => {
        if (line.toLowerCase().startsWith("titre:")) title = line.replace(/titre:/i, "").trim();
        if (line.toLowerCase().startsWith("résumé:")) summary = line.replace(/résumé:/i, "").trim();
        if (line.toLowerCase().startsWith("catégorie:")) {
          const catStr = line.replace(/catégorie:/i, "").trim();
          category = Object.values(Category).find(c => c.toLowerCase() === catStr.toLowerCase()) || Category.INTERNATIONAL;
        }
      });

      // Assigner des sources pertinentes par bloc (ou toutes si peu d'articles)
      const sourcesForThisArticle = webSources.length > 0 
        ? webSources.slice(index * 2, (index * 2) + 2) 
        : [];

      return {
        id: `sn-${Date.now()}-${index}`,
        title,
        summary,
        category,
        sources: sourcesForThisArticle,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Erreur de liaison avec les agences de presse. Réessayez.");
  }
};

import { GoogleGenAI } from "@google/genai";
import { Category, NewsArticle } from '../types';

const SYSTEM_INSTRUCTION = `
Tu es "Stony News AI", un agent d’IA journalistique professionnel rigoureux.
Ton objectif est de fournir des résumés factuels basés UNIQUEMENT sur des sources fiables.

FORMAT DE SORTIE (STRICT) :
Génère pour chaque actualité :
---ARTICLE---
Titre: [Titre informatif court]
Résumé: [5 à 7 lignes expliquant Qui, Quoi, Où, Quand, Pourquoi]
Catégorie: [Choisir parmis: Politique, Économie, Sécurité, Société, Santé, Technologie, Sport, International]
---FIN---

RÈGLES :
- Si la recherche Google est disponible, cite les sources.
- Ne jamais inventer de faits. Reste neutre et factuel.
`;

export const fetchNews = async (query: string): Promise<NewsArticle[]> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("Clé API (API_KEY) non configurée dans Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = 'gemini-3-flash-preview';
  
  const generate = async (useSearch: boolean) => {
    return await ai.models.generateContent({
      model: modelName,
      contents: `Analyse journalistique approfondie sur : "${query}".`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: useSearch ? [{ googleSearch: {} }] : [],
        temperature: 0.2,
      },
    });
  };

  try {
    let response;
    try {
      // Tentative 1 : Avec recherche Google
      response = await generate(true);
    } catch (searchError: any) {
      console.warn("Recherche Google indisponible, passage au mode standard.", searchError);
      // Tentative 2 : Sans recherche Google (Fallback si région non supportée)
      response = await generate(false);
    }

    if (!response || !response.text) {
      throw new Error("L'IA n'a pas pu générer de contenu.");
    }

    const text = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    
    const webSources = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Source Web",
        url: chunk.web?.uri || "#"
      }));

    const articleBlocks = text.split("---ARTICLE---").filter(b => b.trim().length > 20);
    
    // Si aucun bloc n'est trouvé, on traite le texte brut
    if (articleBlocks.length === 0) {
      return [{
        id: `stony-raw-${Date.now()}`,
        title: `Dernières infos : ${query}`,
        summary: text.replace(/---ARTICLE---|---FIN---/g, '').trim().substring(0, 600),
        category: Category.INTERNATIONAL,
        sources: webSources,
        timestamp: "Direct"
      }];
    }

    return articleBlocks.map((block, index) => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      let title = "Actualité";
      let summary = "";
      let category = Category.INTERNATIONAL;

      lines.forEach(line => {
        const lower = line.toLowerCase();
        if (lower.startsWith("titre:")) title = line.split(/titre:/i)[1]?.trim() || title;
        if (lower.startsWith("résumé:")) summary = line.split(/résumé:/i)[1]?.trim() || summary;
        if (lower.startsWith("catégorie:")) {
          const catStr = line.split(/catégorie:/i)[1]?.trim();
          category = Object.values(Category).find(c => c.toLowerCase() === catStr?.toLowerCase()) || Category.INTERNATIONAL;
        }
      });

      return {
        id: `stony-${Date.now()}-${index}`,
        title,
        summary,
        category,
        sources: webSources.length > 0 ? webSources.slice(index * 2, (index * 2) + 2) : [],
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
    });

  } catch (error: any) {
    console.error("Erreur critique:", error);
    throw new Error(error.message || "Problème de connexion au service d'IA.");
  }
};
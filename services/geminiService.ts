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
- Utilise la recherche Google pour trouver les dernières nouvelles.
- Cite les sources (BBC, RFI, France 24, Jeune Afrique, etc.).
- Ne jamais inventer de faits. Si pas d'info, ne rien générer.
`;

export const fetchNews = async (query: string): Promise<NewsArticle[]> => {
  // Récupération sécurisée de la clé API
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    throw new Error("Clé API non détectée. Assurez-vous de l'avoir configurée dans les variables d'environnement Vercel.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Modèle standard optimisé pour la vitesse et les limites
      contents: `Rédige un dossier de presse actualisé sur : "${query}". Utilise la recherche Google pour les faits récents.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });

    const text = response.text || "";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    
    const webSources = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Source Certifiée",
        url: chunk.web?.uri || "#"
      }));

    const articleBlocks = text.split("---ARTICLE---").filter(b => b.trim().length > 20);
    
    return articleBlocks.map((block, index) => {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      let title = "Flash Info";
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

      // On limite à 2 sources par article pour la clarté
      const sourcesForThisArticle = webSources.slice(index * 2, (index * 2) + 2);

      return {
        id: `stony-${Date.now()}-${index}`,
        title,
        summary,
        category,
        sources: sourcesForThisArticle,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
    });

  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("API key")) {
      throw new Error("Clé API invalide ou non autorisée. Vérifiez votre configuration Google AI Studio.");
    }
    throw new Error("Erreur lors de la récupération des données. Réessayez dans quelques instants.");
  }
};
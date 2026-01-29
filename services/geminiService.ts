import { GoogleGenAI } from "@google/genai";
import { Category, NewsArticle } from '../types';

const SYSTEM_INSTRUCTION = `
Tu es "Stony News AI", un agent d’IA journalistique professionnel.
Ton but est de résumer l'actualité de manière neutre et factuelle.

FORMAT DE RÉPONSE STRICT :
---ARTICLE---
Titre: [Titre]
Résumé: [5-7 lignes]
Catégorie: [Politique, Économie, Sécurité, Société, Santé, Technologie, Sport, International]
---FIN---
`;

export const fetchNews = async (query: string): Promise<NewsArticle[]> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "undefined") {
    throw new Error("Clé API manquante. Configurez API_KEY dans Vercel.");
  }

  // Initialisation à chaque appel pour garantir l'utilisation de la clé la plus récente
  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Donne-moi les dernières actualités vérifiées sur : "${query}"`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    if (!text) throw new Error("L'IA a retourné une réponse vide.");

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const webSources = (groundingMetadata?.groundingChunks || [])
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Source",
        url: chunk.web?.uri || "#"
      }));

    const articleBlocks = text.split("---ARTICLE---").filter(b => b.trim().length > 10);

    if (articleBlocks.length === 0) {
      return [{
        id: `raw-${Date.now()}`,
        title: `Actualité : ${query}`,
        summary: text.replace(/---FIN---|---ARTICLE---/g, "").trim().substring(0, 500),
        category: Category.INTERNATIONAL,
        sources: webSources,
        timestamp: "Direct"
      }];
    }

    return articleBlocks.map((block, index) => {
      const lines = block.split('\n').map(l => l.trim());
      let title = "Flash Info";
      let summary = "";
      let category = Category.INTERNATIONAL;

      lines.forEach(line => {
        if (line.toLowerCase().startsWith("titre:")) title = line.substring(6).trim();
        if (line.toLowerCase().startsWith("résumé:")) summary = line.substring(7).trim();
        if (line.toLowerCase().startsWith("catégorie:")) {
          const c = line.substring(10).trim();
          category = Object.values(Category).find(cat => cat.toLowerCase() === c.toLowerCase()) || Category.INTERNATIONAL;
        }
      });

      return {
        id: `${Date.now()}-${index}`,
        title,
        summary,
        category,
        sources: webSources.slice(index * 2, (index * 2) + 2),
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
    });

  } catch (error: any) {
    console.error("Gemini Error:", error);
    // On renvoie le message d'erreur technique pour comprendre pourquoi ça bloque
    throw new Error(error.message || "Erreur de communication avec Gemini.");
  }
};
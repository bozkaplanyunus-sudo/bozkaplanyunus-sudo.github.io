import { GoogleGenAI } from "@google/genai";
import { AIRequestData } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateParentMessage = async (data: AIRequestData): Promise<string> => {
  try {
    const prompt = `
      Tu es un assistant pédagogique utile. Sur la base des informations ci-dessous, rédige un brouillon de message WhatsApp poli, professionnel et court en FRANÇAIS à envoyer au parent d'un élève.

      Nom de l'élève : ${data.studentName}
      Nom du parent : ${data.parentName}
      Sujet/Situation : ${data.topic}

      Le message doit s'adresser directement au parent ("Bonjour [Nom du parent], ...").
      Signe le message avec "[Nom de l'enseignant]".
      Ne renvoie que le contenu du message, n'ajoute aucune autre explication.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Le message n'a pas pu être créé.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Une erreur s'est produite lors de la connexion au service IA.");
  }
};
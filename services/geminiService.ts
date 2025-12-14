import { GoogleGenAI } from "@google/genai";
import { AIRequestData } from '../types';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateParentMessage = async (data: AIRequestData): Promise<string> => {
  try {
    const prompt = `
      Sen yardımcı bir asistan öğretmensin. Aşağıdaki bilgilere dayanarak bir öğrenci velisine göndermek üzere nazik, profesyonel ve kısa bir Türkçe WhatsApp mesajı taslağı oluştur.

      Öğrenci Adı: ${data.studentName}
      Veli Adı: ${data.parentName}
      Konu/Durum: ${data.topic}

      Mesaj doğrudan veliye hitaben yazılmalı ("Sayın [Veli Adı], ...").
      İmza kısmına "[Öğretmen Adı]" yaz.
      Sadece mesaj içeriğini döndür, başka açıklama ekleme.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Mesaj oluşturulamadı.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Yapay zeka servisine bağlanırken bir hata oluştu.");
  }
};
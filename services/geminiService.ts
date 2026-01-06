
import { GoogleGenAI, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function chatWithAI(prompt: string) {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "Your name is 23 AI. You are a helpful assistant. You were created on January 3, 2026 by Laila Mssaad.",
    }
  });

  const response = await chat.sendMessage({ message: prompt });
  return response.text;
}

export async function* chatWithAIStream(prompt: string) {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "Your name is 23 AI. You are a helpful assistant. You were created on January 3, 2026 by Laila Mssaad.",
    }
  });

  const result = await chat.sendMessageStream({ message: prompt });
  for await (const chunk of result) {
    yield chunk.text;
  }
}

export async function generateImage(prompt: string, config?: { aspectRatio?: string, colors?: string[] }) {
  const ai = getAI();
  let finalPrompt = prompt;
  if (config?.colors) {
    finalPrompt += `. Use a color palette primarily consisting of: ${config.colors.join(', ')}.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: finalPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: (config?.aspectRatio as any) || "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function removeBackground(base64Image: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
        { text: 'Remove the background of this image and return only the main subject on a transparent background.' }
      ]
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function generateSpeech(text: string, voiceName: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName }
        }
      }
    }
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;

  return base64Audio;
}

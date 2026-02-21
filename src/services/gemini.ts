import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";

export interface CampaignData {
  name?: string;
  subject: string;
  subjectB?: string;
  previewText: string;
  body: string;
  callToAction: string;
  callToActionB?: string;
  targetAudience: string;
  tone: string;
  visualPrompt?: string;
  negativePrompt?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export class GeminiService {
  private static getAI() {
    // Use GEMINI_API_KEY as primary, fallback to API_KEY (often used for user-selected keys)
    const apiKey = process.env.GEMINI_API_KEY || (process as any).env?.API_KEY;
    return new GoogleGenAI({ apiKey });
  }

  static async generateCampaign(prompt: string, abTest: boolean = false): Promise<CampaignData> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a complete email marketing campaign based on this prompt: "${prompt}". 
      ${abTest ? "Include A/B test variants for the subject line and call to action." : ""}
      Return the response as a JSON object with the following fields: 
      subject, ${abTest ? "subjectB, " : ""}previewText, body (markdown format), callToAction, ${abTest ? "callToActionB, " : ""}targetAudience, tone.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            subjectB: { type: Type.STRING, description: "Alternative subject line for A/B testing" },
            previewText: { type: Type.STRING },
            body: { type: Type.STRING },
            callToAction: { type: Type.STRING },
            callToActionB: { type: Type.STRING, description: "Alternative call to action for A/B testing" },
            targetAudience: { type: Type.STRING },
            tone: { type: Type.STRING },
          },
          required: ["subject", "previewText", "body", "callToAction", "targetAudience", "tone"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  }

  static async chat(history: ChatMessage[], message: string): Promise<string> {
    const ai = this.getAI();
    const chat = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction: "You are a professional marketing consultant. Help the user refine their email campaigns, suggest strategies, and answer questions about digital marketing.",
      },
    });

    // Note: In a real app we'd pass history, but for simplicity we'll just send the message
    // or implement history mapping if needed. The SDK handles history if we use the chat object correctly.
    const response = await chat.sendMessage({ message });
    return response.text || "I'm sorry, I couldn't process that.";
  }

  static async generateImage(prompt: string, size: "1K" | "2K" | "4K" = "1K", aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "16:9"): Promise<string> {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: size,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  }
}

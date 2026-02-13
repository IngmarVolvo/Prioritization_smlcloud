
import { GoogleGenAI, Type } from "@google/genai";
import { DataRequest } from "../types";

export const getAIStrategicInsights = async (requests: DataRequest[]) => {
  // Recommendation: Create instance right before usage to ensure current API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As a senior product strategy consultant for a global data platform, analyze these backlog requests.
    
    Requests Data:
    ${JSON.stringify(requests, null, 2)}
    
    Tasks:
    1. Strategic Summary: Evaluate roadmap health and alignment.
    2. Recommendations: Top 3 prioritized actions.
    3. Risk Analysis: Identify bottlenecks or capacity issues.
    4. Synergy/Duplicate Detection: Identify requests that are similar, duplicates, or semantically related.
       Group them into clusters that should be delivered together to save effort.
    
    Provide a JSON response strictly following the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      // Complex reasoning task: Switching to Pro model
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            risks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            synergies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clusterTitle: { type: Type.STRING },
                  requestIds: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  reasoning: { type: Type.STRING }
                },
                required: ["clusterTitle", "requestIds", "reasoning"]
              }
            }
          },
          required: ["summary", "recommendations", "risks", "synergies"]
        }
      }
    });

    // Directly access text property as defined in GenerateContentResponse
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};

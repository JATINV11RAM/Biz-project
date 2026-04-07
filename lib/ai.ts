import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function callAI(systemPrompt: string, userMessage: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Combine system prompt with user message
    const fullPrompt = `${systemPrompt}\n\n${userMessage}`;

    const result = await model.generateContent(fullPrompt);
    let output = "";

    // Extract text from response
    if (result.response.candidates && result.response.candidates.length > 0) {
      const candidate = result.response.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if ("text" in part) {
            output += part.text;
          }
        }
      }
    }

    return output || "Unable to generate response";
  } catch (error) {
    console.error("BizSaathi AI Error:", error);
    throw new Error("Failed to process your request with BizSaathi AI");
  }
}

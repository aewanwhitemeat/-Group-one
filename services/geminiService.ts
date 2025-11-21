import { GoogleGenAI, Type, Schema } from "@google/genai";
import { LoanAssessmentResult, FarmerProfile, GroundingResult } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

/**
 * Agricultural Loan Assessment using structured JSON output
 */
export const assessFarmLoan = async (profile: FarmerProfile): Promise<LoanAssessmentResult> => {
  if (!apiKey) throw new Error("API Key not found");

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      approved: { type: Type.BOOLEAN, description: "Whether the loan is approved based on potential yield." },
      creditScore: { type: Type.INTEGER, description: "Agri-credit score (300-850) based on crop viability and risk." },
      approvedAmount: { type: Type.INTEGER, description: "The amount in KES approved for disbursement." },
      interestRate: { type: Type.NUMBER, description: "Interest rate percentage." },
      repaymentDate: { type: Type.STRING, description: "Estimated date of repayment based on harvest cycle (YYYY-MM-DD)." },
      riskAnalysis: {
        type: Type.OBJECT,
        properties: {
          weatherRisk: { type: Type.STRING, description: "Assessment of weather risks for this location/crop." },
          marketRisk: { type: Type.STRING, description: "Volatility of the produce price." },
          pestDiseaseRisk: { type: Type.STRING, description: "Risk of pests/diseases for this specific produce." }
        }
      },
      projectedRevenue: { type: Type.INTEGER, description: "Estimated revenue in KES after harvest." },
      recommendation: { type: Type.STRING, description: "Concise advice for the loan officer." }
    },
    required: ["approved", "creditScore", "approvedAmount", "interestRate", "repaymentDate", "riskAnalysis", "projectedRevenue", "recommendation"]
  };

  const prompt = `
    Act as an agricultural loan underwriter for the Kenyan market. Analyze this farmer's profile to approve a micro-loan for inputs (fertilizer, feeds, seeds).
    
    Farmer Profile:
    - Produce: ${profile.specificProduce} (${profile.farmType})
    - Location: ${profile.location}
    - Size: ${profile.farmSize} (Acres/Heads)
    - Cycle Stage: ${profile.cycleStage}
    - Requested: KES ${profile.requestedAmount}
    - History: ${profile.previousYieldHistory}

    Consider:
    1. Crop cycle duration for repayment date.
    2. Typical yield per acre/head for this produce in Kenya.
    3. Market value of the produce.
    4. If the requested amount is reasonable for inputs for this size.

    The loan is "Lipa Mdogo Mdogo" (small installments) or bullet payment after harvest via M-PESA.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.3,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as LoanAssessmentResult;
  } catch (error) {
    console.error("Agri Scoring Error:", error);
    throw error;
  }
};

/**
 * Market Intelligence (Grounding)
 */
export const verifyMarketData = async (query: string): Promise<GroundingResult> => {
  if (!apiKey) throw new Error("API Key not found");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a market research assistant for farmers. Verify the following query using Google Search. 
      
      Query: "${query}"
      
      Focus on current market prices in Kenya, weather patterns, or government subsidies.
      If search results support the query, classify as Verified. If contradictory, Contradicted.
      `,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1
      }
    });

    const verificationText = response.text || "No analysis generated.";
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = groundingChunks
      .map(chunk => chunk.web)
      .filter(web => web && web.uri && web.title)
      .map(web => ({ uri: web!.uri!, title: web!.title! }));

    const lowerText = verificationText.toLowerCase();
    let confidence: 'Verified' | 'Contradicted' | 'Unverified' = 'Unverified';
    
    if (lowerText.includes("correct") || lowerText.includes("accurate") || lowerText.includes("supports") || lowerText.includes("verified")) {
      confidence = 'Verified';
    } else if (lowerText.includes("incorrect") || lowerText.includes("false") || lowerText.includes("contradicts")) {
      confidence = 'Contradicted';
    }

    return {
      verificationText,
      sources,
      confidence
    };

  } catch (error) {
    console.error("Grounding Error:", error);
    throw error;
  }
};
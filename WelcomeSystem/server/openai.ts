import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "" 
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const DEFAULT_MODEL = "gpt-4o";

/**
 * Generate startup recommendations based on user input
 */
export async function generateStartupRecommendations(ideaDescription: string, industry: string) {
  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a startup advisor specialized in helping entrepreneurs refine their ideas. Provide concise, actionable advice."
        },
        {
          role: "user",
          content: `I'm thinking of creating a startup in the ${industry} industry. My idea is: ${ideaDescription}. Please provide a brief analysis and recommendations.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      success: true,
      data: JSON.parse(response.choices[0].message.content || "{}")
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      success: false,
      error: "Failed to generate recommendations. Please check your OpenAI API key or try again later."
    };
  }
}

/**
 * Generate business model suggestions based on startup information
 */
export async function generateBusinessModelSuggestions(
  ideaDescription: string, 
  industry: string,
  targetAudience: string
) {
  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a business model expert who helps startups identify the most suitable revenue strategies."
        },
        {
          role: "user",
          content: `Please suggest business models for my startup:
          Industry: ${industry}
          Idea: ${ideaDescription}
          Target audience: ${targetAudience}
          
          Provide JSON response with: suitableModels (array), description (string), and reasoning (string).`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      success: true,
      data: JSON.parse(response.choices[0].message.content || "{}")
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      success: false,
      error: "Failed to generate business model suggestions. Please check your OpenAI API key or try again later."
    };
  }
}

/**
 * Generate pitch deck outline based on startup information
 */
export async function generatePitchDeckOutline(
  startupName: string,
  ideaDescription: string,
  industry: string,
  targetAudience: string,
  businessModel: string
) {
  try {
    const response = await openai.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a pitch deck expert who helps startups create compelling presentations for investors."
        },
        {
          role: "user",
          content: `Create a pitch deck outline for my startup:
          Name: ${startupName}
          Industry: ${industry}
          Idea: ${ideaDescription}
          Target audience: ${targetAudience}
          Business model: ${businessModel}
          
          Provide JSON response with slides array containing title and content fields for each slide.`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    return {
      success: true,
      data: JSON.parse(response.choices[0].message.content || "{}")
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      success: false,
      error: "Failed to generate pitch deck outline. Please check your OpenAI API key or try again later."
    };
  }
}

export default openai;
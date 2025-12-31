const intentDefinitions = require("../intents/intentDefinitions");
const intentHandlers = require("../intents/intentHandlers");
const { USE_LLM } = require("../config/llm.config");
const CONFIDENCE_THRESHOLD = 0.6;


/*
  MOCK LLM RESPONSE (FREE / DEVELOPMENT MODE)
 Used when no real LLM API key is available
 */
function mockLLMIntentDetection(message) {
  const text = message.toLowerCase();

  for (const [intent, data] of Object.entries(intentHandlers)) {
    const matchedKeywords = data.keywords.filter(keyword =>
      text.includes(keyword)
    );

    if (matchedKeywords.length > 0) {
      return {
        intent,
        confidence: Math.min(0.5 + matchedKeywords.length * 0.2, 0.95)
      };
    }
  }

  return {
    intent: "unknown",
    confidence: 0.0
  };
}



//  PROMPT BUILDER FOR REAL LLM (PRODUCTION MODE)
 
function buildPrompt(message) {
  const intentList = Object.entries(intentDefinitions)
    .map(([key, description]) => `- ${key}: ${description}`)
    .join("\n");

  return `
You are an AI assistant for customer support.

Classify the user's intent into ONE of the following categories:
${intentList}

Rules:
- Respond with ONLY the intent name
- Do not explain anything
- If unclear, respond with "unknown"

User message:
"${message}"
`;
}


//   MAIN INTENT DETECTOR

async function detectIntent(message) {
  if (!USE_LLM) {
    return mockLLMIntentDetection(message);
  }


  return { intent: "unknown", confidence: 0.0 };
}



//   RESPONSE GENERATOR

function generateResponse({ intent, confidence }) {
  if (intent === "unknown" || confidence < CONFIDENCE_THRESHOLD) {
    return {
      type: "fallback",
      message:
        "I want to make sure I understand correctly. Could you please provide a bit more detail or clarify your issue?"
    };
  }

  return {
    type: "intent",
    message: intentHandlers[intent].response
  };
}


module.exports = {
  detectIntent,
  generateResponse
};

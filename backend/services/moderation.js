const { OpenAI } = require('openai');

const DEMO_CRITICAL_KEYWORDS = [
  "i want to die",
  "i can't live anymore",
  "ending my life",
  "no reason to live"
];

const moderationService = async (text) => {
  const normalizedText = text.toLowerCase();
  
  // 1. Keyword Pre-filter (Guaranteed Demo Trigger)
  const isCriticalKeyword = DEMO_CRITICAL_KEYWORDS.some(kw => normalizedText.includes(kw));
  if (isCriticalKeyword) {
    console.log("Moderation: Caught by keyword pre-filter -> CRITICAL");
    return 'CRITICAL';
  }
  if (!process.env.OPENAI_API_KEY) {
    console.warn("No OPENAI_API_KEY provided. Skipping moderation.");
    return 'SAFE';
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.moderations.create({ input: text });
    const result = response.results[0];

    if (result.flagged) {
      // Check for critical categories (self-harm, severe distress)
      if (
        result.categories['self-harm'] || 
        result.categories['self-harm/intent'] || 
        result.categories['self-harm/instructions']
      ) {
        return 'CRITICAL';
      }
      return 'FLAGGED';
    }

    return 'SAFE';
  } catch (error) {
    console.error("Moderation API error:", error);
    // Fallback to safe so chat doesn't break if API fails
    return 'SAFE';
  }
};

module.exports = { moderationService };

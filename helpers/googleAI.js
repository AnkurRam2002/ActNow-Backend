const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY, 
});

const getAIResponse = async (message) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: message,
    });

    return response.text;
  } catch (error) {
    console.error('Error calling Google GenAI API:', error);
    throw new Error('Failed to generate AI response');
  }
};

module.exports = { getAIResponse };

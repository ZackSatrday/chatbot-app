import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API with your key
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Configure the model - using the current version of Gemini
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// System prompt to encourage formatting (we'll use this as a regular message in history)
const formatInstructions = `You are a helpful assistant implemented in a modern chat interface that supports GitHub-flavored Markdown. 
Use Markdown formatting in your responses to improve readability:

- Use **bold text** for emphasis or important information
- Use # Heading 1, ## Heading 2, and ### Heading 3 for section titles
- Use bulleted lists with - or * for unordered information
- Use numbered lists (1. 2. 3.) for sequential steps
- Format code with \`\`\` language-name at the beginning and \`\`\` at the end, including the language name for syntax highlighting
- Use \`inline code\` for short code references
- Create tables with | and - for structured data
- Use > for blockquotes

Your responses should be well-structured, informative, and visually appealing.`;

// History to maintain context of the conversation
let chatHistory = [
  { role: "user", parts: [{ text: formatInstructions }] },
  { role: "model", parts: [{ text: "I'll use markdown formatting in my responses to make them more readable and structured. I'll use various elements like lists, tables, code blocks with proper syntax highlighting, headings, and other formatting features when appropriate for the content. This will help make my responses more organized and easier to understand." }] }
];

/**
 * Get a response from Gemini AI based on user input and conversation history
 * @param {string} userInput - The user's message
 * @returns {Promise<string>} - Gemini's response
 */
export const getChatResponse = async (userInput) => {
  try {
    // Add user input to history
    chatHistory.push({ role: "user", parts: [{ text: userInput }] });
    
    // Configure the generation
    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    // Create a chat session without system instruction
    const chat = model.startChat({
      history: chatHistory,
      generationConfig,
    });

    // Generate response
    const result = await chat.sendMessage(userInput);
    const responseText = result.response.text();

    // Add bot response to history
    chatHistory.push({ role: "model", parts: [{ text: responseText }] });
    
    return responseText;
  } catch (error) {
    console.error("Error getting response from Gemini:", error);
    return "Sorry, I encountered an error processing your request. Please try again later.";
  }
};

/**
 * Reset the chat history
 */
export const resetChatHistory = () => {
  chatHistory = [
    { role: "user", parts: [{ text: formatInstructions }] },
    { role: "model", parts: [{ text: "I'll use markdown formatting in my responses to make them more readable and structured. I'll use various elements like lists, tables, code blocks with proper syntax highlighting, headings, and other formatting features when appropriate for the content. This will help make my responses more organized and easier to understand." }] }
  ];
};

/**
 * Get the current chat history
 * @returns {Array} - The current chat history
 */
export const getChatHistory = () => {
  return chatHistory;
}; 
# React Chatbot App with Gemini AI

A responsive chatbot web application built with React, Vite, and Google's Gemini AI model.

## Features

- Modern, responsive UI
- AI-powered responses from Google's Gemini model
- Conversation history with context awareness
- Error handling and loading states
- Reset conversation functionality
- Clean and intuitive interface
- Material Design components
- Custom animations and styling

## Technologies Used

- React - UI library
- Vite - Fast build tool and dev server
- Material UI - Component library
- Google Gemini AI - Conversational AI model
- JavaScript - Programming language

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API key (get it from [Google AI Studio](https://ai.google.dev/))

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd chatbot-app
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
- Create a `.env` file in the root directory (or rename the existing `.env.example`)
- Add your Gemini API key:
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

4. Start the development server
```bash
npm run dev
```

5. Open your browser and navigate to the URL provided in the terminal (typically http://localhost:5173)

## Project Structure

```
chatbot-app/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   └── Chatbot.jsx     # Main chatbot component
│   ├── services/
│   │   └── geminiService.js # Google Gemini API integration
│   ├── App.css             # App-wide styles
│   ├── App.jsx             # Main App component with theme
│   ├── index.css           # Global styles
│   └── main.jsx            # Entry point
├── .env                    # Environment variables (API keys)
├── index.html
├── package.json
└── README.md
```

## How it Works

1. The application uses the Google Generative AI SDK to communicate with the Gemini API
2. When a user sends a message, it's sent to the Gemini model along with conversation history
3. The model generates a contextual response based on the conversation
4. The response is displayed in the chat interface
5. The chat history is maintained to provide context for future interactions

## Customization

You can customize the chatbot by:

1. Modifying the theme in `App.jsx`
2. Adjusting the Gemini model parameters in `geminiService.js` to change the response style:
   - temperature: Controls randomness (higher = more random)
   - topK/topP: Controls diversity of responses
   - maxOutputTokens: Controls maximum response length

## Building for Production

To build the app for production:

```bash
npm run build
```

This will generate optimized files in the `dist` directory that can be deployed to a web server.

## Important Notes

- Keep your API key secure and never commit it to version control
- The Gemini API may have usage limits depending on your account

## License

MIT

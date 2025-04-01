import { useState, useEffect, useMemo, useRef } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Alert, Snackbar, Box } from '@mui/material';
import Chatbot from './components/Chatbot';
import Header from './components/Header';
import { resetChatHistory } from './services/geminiService';
import './App.css';

function App() {
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  const [mode, setMode] = useState('light');
  const chatbotRef = useRef();

  // Check if API key is set
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      setShowApiKeyWarning(true);
    }
    
    // Check for saved theme preference
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // Set dark mode if user prefers dark color scheme
      setMode('dark');
    }
  }, []);

  // Toggle color mode between light and dark
  const toggleColorMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Handle reset conversation
  const handleReset = () => {
    // Reset the chat history in the service
    resetChatHistory();
    
    // Reset the component state if needed
    if (chatbotRef.current && typeof chatbotRef.current.resetMessages === 'function') {
      chatbotRef.current.resetMessages();
    }
  };

  // Create theme based on current mode
  const theme = useMemo(() => 
    createTheme({
      palette: {
        mode,
        primary: {
          main: mode === 'dark' ? '#90caf9' : '#1976d2',
        },
        secondary: {
          main: mode === 'dark' ? '#81c784' : '#4caf50',
        },
        background: {
          default: mode === 'dark' ? '#121212' : '#f5f5f5',
          paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
        },
        error: {
          main: mode === 'dark' ? '#f48fb1' : '#d32f2f',
        },
        text: {
          primary: mode === 'dark' ? '#e0e0e0' : '#212121',
          secondary: mode === 'dark' ? '#aaaaaa' : '#757575',
        },
      },
      typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
          fontWeight: 600,
          fontFamily: '"Poppins", sans-serif',
        },
        body1: {
          fontFamily: '"Poppins", sans-serif',
        },
        button: {
          fontFamily: '"Poppins", sans-serif',
        },
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              transition: 'all 0.3s ease',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              boxShadow: mode === 'dark' 
                ? '0 4px 20px 0 rgba(0, 0, 0, 0.5)'
                : '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
    }), [mode]);

  const handleCloseWarning = () => {
    setShowApiKeyWarning(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.default,
          transition: 'background-color 0.3s ease',
          margin: 0,
          padding: 0,
        }}
      >
        <Header toggleColorMode={toggleColorMode} onReset={handleReset} />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Chatbot ref={chatbotRef} />
        </Box>
      </Box>
      <Snackbar open={showApiKeyWarning} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert 
          severity="warning" 
          variant="filled"
          onClose={handleCloseWarning}
        >
          Please add your Gemini API key in the .env file to use the AI features.
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;

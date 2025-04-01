import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Box, TextField, Paper, Typography, Container, Avatar, IconButton, CircularProgress, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CodeIcon from '@mui/icons-material/Code';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { getChatResponse, resetChatHistory } from '../services/geminiService';

const Chatbot = forwardRef((props, ref) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { text: 'Hello! I am powered by Google Gemini AI. How can I help you today?\n\nI can help with:\n- Answering questions\n- Writing content\n- Code examples\n- Problem solving', sender: 'bot' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [typingIndex, setTypingIndex] = useState(-1);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Expose the resetMessages method to parent component via ref
  useImperativeHandle(ref, () => ({
    resetMessages: () => {
      setMessages([
        { text: 'Chat history has been reset. How can I help you today?\n\nI can help with:\n- Answering questions\n- Writing content\n- Code examples\n- Problem solving', sender: 'bot' }
      ]);
      setTypingIndex(0);
      setDisplayedText('');
      setIsTyping(true);
    }
  }));

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSend = async () => {
    if (input.trim() === '') return;

    // Add user message
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInput('');
    
    // Show loading state
    setIsLoading(true);
    setError(null);
    
    try {
      // Get response from Gemini
      const botResponse = await getChatResponse(input.trim());
      
      // Add bot response
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
      
      // Set typing index to the last message (the bot response)
      setTypingIndex(messages.length + 1); // +1 because we just added the user message
      setDisplayedText('');
      setIsTyping(true);
    } catch (err) {
      console.error('Failed to get response from Gemini:', err);
      setError('Failed to get a response. Please try again.');
      setMessages(prev => [...prev, { 
        text: 'Sorry, I encountered an error. Please try again later.', 
        sender: 'bot',
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    // Reset chat history in the service
    resetChatHistory();
    
    // Reset messages in the UI
    setMessages([
      { text: 'Chat history has been reset. How can I help you today?\n\nI can help with:\n- Answering questions\n- Writing content\n- Code examples\n- Problem solving', sender: 'bot' }
    ]);
    setTypingIndex(0);
    setDisplayedText('');
    setIsTyping(true);
  };

  const insertTemplate = (template) => {
    setInput(prev => prev + template);
  };

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayedText]);

  // Typing effect for bot responses
  useEffect(() => {
    if (typingIndex >= 0 && typingIndex < messages.length && messages[typingIndex].sender === 'bot') {
      const fullText = messages[typingIndex].text;
      
      if (displayedText.length < fullText.length) {
        setIsTyping(true);
        const typingSpeed = Math.random() * 10 + 10; // Random typing speed between 10-20ms per character
        
        const timeout = setTimeout(() => {
          setDisplayedText(fullText.substring(0, displayedText.length + 1));
        }, typingSpeed);
        
        return () => clearTimeout(timeout);
      } else {
        setIsTyping(false);
      }
    }
  }, [typingIndex, displayedText, messages]);

  // Custom components for markdown rendering
  const MarkdownComponents = {
    // Add a root wrapper component
    root: ({ node, ...props }) => (
      <Box component="div" className="markdown-content" sx={{ fontFamily: "'Poppins', sans-serif" }} {...props} />
    ),
    // Override h1 rendering
    h1: ({ node, ...props }) => (
      <Typography variant="h5" component="h1" sx={{ my: 1, fontWeight: 'bold', color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2', fontFamily: "'Poppins', sans-serif" }} {...props} />
    ),
    // Override h2 rendering
    h2: ({ node, ...props }) => (
      <Typography variant="h6" component="h2" sx={{ my: 1, fontWeight: 'bold', color: theme => theme.palette.mode === 'dark' ? '#e0e0e0' : '#333', fontFamily: "'Poppins', sans-serif" }} {...props} />
    ),
    // Override h3 rendering
    h3: ({ node, ...props }) => (
      <Typography variant="subtitle1" component="h3" sx={{ my: 1, fontWeight: 'bold', fontFamily: "'Poppins', sans-serif" }} {...props} />
    ),
    // Override p rendering
    p: ({ node, ...props }) => (
      <Typography variant="body1" component="p" sx={{ my: 1, fontFamily: "'Poppins', sans-serif" }} {...props} />
    ),
    // Override li rendering
    li: ({ node, ...props }) => (
      <Box component="li" sx={{ my: 0.5 }}>
        <Typography variant="body1" component="span" {...props} />
      </Box>
    ),
    // Override code rendering
    code: ({ node, inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match && match[1] ? match[1] : '';
      return !inline ? (
        <Box component="div" sx={{ 
          my: 1, 
          p: 1, 
          backgroundColor: theme => theme.palette.mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
          borderRadius: 1,
          overflowX: 'auto',
          borderLeft: theme => `3px solid ${theme.palette.mode === 'dark' ? '#90caf9' : '#1976d2'}`
        }}>
          <pre style={{ margin: 0 }}>
            <code className={language ? `hljs language-${language}` : ''} {...props}>
              {children}
            </code>
          </pre>
        </Box>
      ) : (
        <Typography component="code" sx={{ 
          backgroundColor: theme => theme.palette.mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
          color: theme => theme.palette.mode === 'dark' ? '#e0e0e0' : 'inherit',
          px: 0.5,
          py: 0.3,
          borderRadius: 0.5,
          fontFamily: 'monospace',
          fontSize: '0.9em'
        }} {...props}>
          {children}
        </Typography>
      );
    },
    // Override blockquote rendering
    blockquote: ({ node, ...props }) => (
      <Box component="blockquote" sx={{ 
        my: 1, 
        py: 0.5, 
        pl: 2, 
        borderLeft: theme => `3px solid ${theme.palette.mode === 'dark' ? '#aaaaaa' : '#9e9e9e'}`,
        color: theme => theme.palette.mode === 'dark' ? '#aaaaaa' : '#616161'
      }} {...props} />
    ),
    // Override strong rendering
    strong: ({ node, ...props }) => (
      <Typography component="strong" sx={{ fontWeight: 'bold' }} {...props} />
    ),
    // Add a custom hr
    hr: ({ node, ...props }) => (
      <Divider sx={{ my: 2 }} {...props} />
    ),
    // Add table components
    table: ({ node, ...props }) => (
      <Box component="div" sx={{ 
        my: 2, 
        overflowX: 'auto', 
        width: '100%',
        borderRadius: 1,
        border: '1px solid #e0e0e0',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }} {...props} />
      </Box>
    ),
    thead: ({ node, ...props }) => (
      <thead style={{ backgroundColor: '#f5f5f5' }} {...props} />
    ),
    tbody: ({ node, ...props }) => (
      <tbody {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr style={{ borderBottom: '1px solid #e0e0e0' }} {...props} />
    ),
    th: ({ node, ...props }) => (
      <th style={{ padding: '8px 16px', textAlign: 'left', fontWeight: 'bold' }} {...props} />
    ),
    td: ({ node, ...props }) => (
      <td style={{ padding: '8px 16px', textAlign: 'left' }} {...props} />
    ),
  };

  return (
    <Container maxWidth="md" sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', pt: 0, pb: 2 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          flexGrow: 1, 
          mb: 2, 
          p: 2, 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 180px)',
          backgroundColor: theme => theme.palette.background.paper,
          borderRadius: 2,
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
              opacity: 1,
              transform: 'translateY(0)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              animation: `${message.sender === 'user' ? 'slideInRight' : 'slideInLeft'} 0.3s ease-out forwards`,
            }}
          >
            {message.sender === 'bot' && (
              <Avatar sx={{ bgcolor: theme => theme.palette.mode === 'dark' ? '#303F9F' : '#1976d2', mr: 1 }}>G</Avatar>
            )}
            <Paper
              elevation={1}
              sx={{
                p: 2,
                backgroundColor: theme => {
                  if (message.isError) {
                    return theme.palette.mode === 'dark' ? '#b71c1c20' : '#ffebee';
                  }
                  return message.sender === 'user' 
                    ? (theme.palette.mode === 'dark' ? '#1a237e30' : '#e3f2fd') 
                    : (theme.palette.mode === 'dark' ? '#212121' : '#f5f5f5');
                },
                color: theme => theme.palette.text.primary,
                maxWidth: '70%',
                borderRadius: 2,
                position: 'relative',
                overflow: 'hidden',
                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              }}
            >
              {message.sender === 'bot' ? (
                index === typingIndex && isTyping ? (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: message.isError 
                        ? theme => theme.palette.mode === 'dark' ? '#f48fb1' : '#d32f2f'
                        : theme => theme.palette.text.primary,
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {displayedText}
                    <span className="typing-cursor">|</span>
                  </Typography>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[[rehypeHighlight, {detect: true}], rehypeSanitize]}
                    components={MarkdownComponents}
                    skipHtml={false}
                  >
                    {message.text}
                  </ReactMarkdown>
                )
              ) : (
                <Typography 
                  variant="body1" 
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {message.text}
                </Typography>
              )}
            </Paper>
            {message.sender === 'user' && (
              <Avatar sx={{ bgcolor: theme => theme.palette.mode === 'dark' ? '#2e7d32' : '#4caf50', ml: 1 }}>U</Avatar>
            )}
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
            <Avatar sx={{ bgcolor: theme => theme.palette.mode === 'dark' ? '#303F9F' : '#1976d2', mr: 1 }}>G</Avatar>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                backgroundColor: theme => theme.palette.mode === 'dark' ? '#212121' : '#f5f5f5',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '50px',
                border: theme => theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              }}
            >
              <CircularProgress size={20} thickness={4} color="primary" />
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            size="small" 
            title="Insert code example" 
            onClick={() => insertTemplate("\n```javascript\n// Your code here\n```")}
            sx={{ color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#757575' }}
          >
            <CodeIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            title="Insert list" 
            onClick={() => insertTemplate("\n- Item 1\n- Item 2\n- Item 3")}
            sx={{ color: theme => theme.palette.mode === 'dark' ? '#90caf9' : '#757575' }}
          >
            <FormatListBulletedIcon fontSize="small" />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type your message here..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            variant="outlined"
            size="medium"
            disabled={isLoading || isTyping}
            multiline
            minRows={1}
            maxRows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'white',
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme => theme.palette.primary.main,
                },
              },
            }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading || isTyping}
            sx={{ 
              bgcolor: theme => theme.palette.mode === 'dark' ? '#303F9F' : '#1976d2', 
              color: 'white',
              height: 56,
              width: 56,
              '&:hover': {
                bgcolor: theme => theme.palette.mode === 'dark' ? '#1A237E' : '#0d47a1',
              },
              '&.Mui-disabled': {
                bgcolor: theme => theme.palette.mode === 'dark' ? '#424242' : '#e0e0e0',
                color: theme => theme.palette.mode === 'dark' ? '#616161' : '#9e9e9e',
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} thickness={4} color="inherit" /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
});

export default Chatbot; 
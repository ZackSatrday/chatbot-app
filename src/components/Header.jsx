import { AppBar, Toolbar, Typography, IconButton, Box, useTheme, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import GitHubIcon from '@mui/icons-material/GitHub';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import RefreshIcon from '@mui/icons-material/Refresh';

const Header = ({ toggleColorMode, onReset }) => {
  const theme = useTheme();
  
  return (
    <AppBar 
      position="static" 
      color="primary" 
      elevation={0}
      sx={{ 
        marginBottom: 2, 
        marginTop: 0,
        borderRadius: '0 0 10px 10px',
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(to right, #1A237E, #303F9F)' 
          : 'linear-gradient(to right, #1976d2, #42a5f5)'
      }}
    >
      <Toolbar>
        <SmartToyIcon sx={{ mr: 1.5, fontSize: '1.8rem' }} />
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontFamily: 'Poppins, sans-serif', 
            fontWeight: 600,
            fontSize: { xs: '1.2rem', sm: '1.5rem' } 
          }}
        >
          Gemini AI Chatbot
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title="Reset conversation">
            <IconButton color="inherit" onClick={onReset}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={theme.palette.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton 
              color="inherit" 
              onClick={toggleColorMode} 
            >
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title="View on GitHub">
            <IconButton 
              color="inherit" 
              href="https://github.com" 
              target="_blank"
              rel="noopener noreferrer"
              sx={{ ml: 1 }}
            >
              <GitHubIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 
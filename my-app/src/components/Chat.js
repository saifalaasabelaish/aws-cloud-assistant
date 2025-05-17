import React, { useState, useEffect } from 'react';
import { fetchAuthSession, signOut } from '@aws-amplify/auth';
import { LexRuntimeV2 } from '@aws-sdk/client-lex-runtime-v2';
import {
  TextField, List, ListItem, Paper, Container, Typography, Box,
  IconButton, CircularProgress, AppBar, Toolbar, Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const ChatContainer = styled(Paper)(({ theme }) => ({
  height: '70vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
}));

const MessageList = styled(List)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.9)',
}));

const MessageItem = styled(ListItem)(({ theme, sender }) => ({
  background: sender === 'user' ? '#bbdefb' : '#f5f5f5',
  borderRadius: 12,
  margin: theme.spacing(1, 0),
  maxWidth: '70%',
  wordWrap: 'break-word',
  alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
}));

function Chat() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [lexClient, setLexClient] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeLex = async () => {
      try {
        setIsLoading(true);

        const session = await fetchAuthSession();

        if (!session || !session.credentials || !session.credentials.accessKeyId) {
          navigate('/login');
          return;
        }

        const credentials = session.credentials;
        const identityId = session.identityId;

        const lexRuntimeClient = new LexRuntimeV2({
          region: 'us-east-1',
          credentials: {
            accessKeyId: credentials.accessKeyId,
            secretAccessKey: credentials.secretAccessKey,
            sessionToken: credentials.sessionToken
          }
        });

        setLexClient(lexRuntimeClient);
        setSessionId(identityId);
      } catch (error) {
        console.error('Error initializing Lex client:', error);
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    initializeLex();
  }, [navigate]);

  const handleSend = async () => {
    if (!message.trim() || !lexClient) return;

    setMessages(prev => [...prev, { text: message, sender: 'user' }]);

    try {
      const params = {
        botId: 'SHMD3PHZNQ',
        botAliasId: 'TSTALIASID',
        localeId: 'en_US',
        sessionId: sessionId,
        text: message,
      };

      const response = await lexClient.recognizeText(params);
      console.log('Lex full response:', response);

      // Log all interpretations with intent name and confidence
      if (response.interpretations && response.interpretations.length > 0) {
        response.interpretations.forEach((interp, i) => {
          console.log(`Interpretation ${i}: intent = ${interp.intent.name}, confidence = ${interp.nluConfidence?.score}`);
        });
      }

      const intentName = response.sessionState?.intent?.name;
      console.log('Matched intent:', intentName);

      if (response.messages && response.messages.length > 0) {
        const botMessage = response.messages[0].content;
        setMessages(prev => [...prev, { text: botMessage, sender: 'bot' }]);
      } else {
        setMessages(prev => [...prev, { text: "I didn't understand that. Can you rephrase?", sender: 'bot' }]);
      }
    } catch (error) {
      console.error("Error communicating with Lex:", error);
      setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting. " + error.message, sender: 'bot' }]);
    }

    setMessage('');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Initializing Chat...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <AppBar position="static" sx={{ borderRadius: 2, mb: 2 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Cloud Assistant
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <ChatContainer elevation={6}>
        <MessageList>
          {messages.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
              <Typography variant="body1">
                Start chatting with the Cloud Assistant. Ask anything!
              </Typography>
            </Box>
          ) : (
            messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <MessageItem sender={msg.sender}>
                  <Typography variant="body1">{msg.text}</Typography>
                </MessageItem>
              </Box>
            ))
          )}
        </MessageList>
        <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center', bgcolor: 'rgba(255, 255, 255, 0.9)' }}>
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            sx={{ bgcolor: 'white', borderRadius: 8 }}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!lexClient}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            sx={{ bgcolor: '#1976d2', color: 'white', '&:hover': { bgcolor: '#1565c0' } }}
            disabled={!lexClient}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </ChatContainer>
    </Container>
  );
}

export default Chat;

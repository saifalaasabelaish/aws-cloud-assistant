import React, { useState } from 'react';
import AWS from 'aws-sdk';
import { TextField, List, ListItem, Paper, Container, Typography, Box, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { styled } from '@mui/material/styles';

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

  // Configure AWS SDK with your Identity Pool ID
  AWS.config.region = 'us-east-1'; // Your region
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-east-1:7c88856e-435f-4459-a315-f56766bfdec6', // Your Identity Pool ID
  });

  const lexruntime = new AWS.LexRuntime();

  const handleSend = async () => {
    if (!message.trim()) return;

    const params = {
      botAlias: '$LATEST', // or your bot alias
      botName: 'CloudAssistant',
      inputText: message,
      userId: 'user1', // You can make this dynamic if you want
      sessionAttributes: {},
    };

    try {
      const data = await lexruntime.postText(params).promise();

      setMessages((prev) => [
        ...prev,
        { text: message, sender: 'user' },
        { text: data.message || 'No response from bot', sender: 'bot' },
      ]);
    } catch (err) {
      console.error('Lex error:', err);
      setMessages((prev) => [...prev, { text: 'Error communicating with bot.', sender: 'bot' }]);
    }

    setMessage('');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <ChatContainer elevation={6}>
        <Box sx={{ p: 2, bgcolor: '#1976d2', color: 'white', textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Chat with Cloud Assistant
          </Typography>
        </Box>
        <MessageList>
          {messages.map((msg, index) => (
            <MessageItem key={index} sender={msg.sender}>
              {msg.text}
            </MessageItem>
          ))}
        </MessageList>
        <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            sx={{ bgcolor: 'white', borderRadius: 8 }}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            sx={{ bgcolor: '#1976d2', color: 'white', '&:hover': { bgcolor: '#1565c0' } }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </ChatContainer>
    </Container>
  );
}

export default Chat;
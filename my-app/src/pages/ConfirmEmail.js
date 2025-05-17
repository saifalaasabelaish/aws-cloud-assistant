// ConfirmEmail.js
import React, { useState } from 'react';
import { confirmSignUp, signIn } from '@aws-amplify/auth';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, Container, Typography, Box, Paper } from '@mui/material';

function ConfirmEmail() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const username = localStorage.getItem('signupUsername');
  const password = localStorage.getItem('signupPassword');

  const handleConfirm = async () => {
    if (!username || !password) {
      alert('Signup session expired. Please sign up again.');
      navigate('/signup');
      return;
    }

    setLoading(true);

    try {
      await confirmSignUp({ username, confirmationCode: code });

      // Auto sign-in after confirmation
      await signIn({ username, password });

      // Clean up
      localStorage.removeItem('signupUsername');
      localStorage.removeItem('signupPassword');

      navigate('/chat');
    } catch (error) {
      alert('Confirmation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Confirm Your Email
          </Typography>
          <Typography variant="body2">
            Enter the code sent to your email to complete signup.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Confirmation Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            fullWidth
            required
          />
          <Button
            variant="contained"
            onClick={handleConfirm}
            fullWidth
            disabled={loading}
            sx={{ fontWeight: 'bold', textTransform: 'none' }}
          >
            {loading ? 'Confirming...' : 'Confirm'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default ConfirmEmail;

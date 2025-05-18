// Signup.js
import React, { useState } from 'react';
import { signUp } from 'aws-amplify/auth';
import { Button, TextField, Container, Typography, Box, Paper, Link } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      await signUp({
        username,
        password,
        options: {
          userAttributes: { email },
        },
      });

      // Save username + password temporarily for confirmation/sign-in
      localStorage.setItem('signupUsername', username);
      localStorage.setItem('signupPassword', password);

      navigate('/confirm-email');
    } catch (error) {
      alert('Signup failed: ' + error.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Create an Account
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Join us to start chatting!
          </Typography>
        </Box>

        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          <Button variant="contained" onClick={handleSignup} fullWidth sx={{ mt: 2 }}>
            Sign Up
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" sx={{ fontWeight: 'bold' }}>
              Log In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Signup;

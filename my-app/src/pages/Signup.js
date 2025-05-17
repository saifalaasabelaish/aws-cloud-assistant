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
          userAttributes: {
            email: email,
          },
          autoSignIn: {
            enabled: true,
          },
        },
      });
      alert('Signup successful! Redirecting to Chat...');
      navigate('/chat');
    } catch (error) {
      alert('Signup failed: ' + error.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1976d2' }}>
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
            variant="outlined"
            sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            variant="outlined"
            sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}
            required
          />
          <Button
            variant="contained"
            onClick={handleSignup}
            fullWidth
            sx={{
              mt: 2,
              py: 1.5,
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              fontWeight: 'bold',
              textTransform: 'none',
            }}
          >
            Sign Up
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Log In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Signup;
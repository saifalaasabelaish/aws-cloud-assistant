// Login.js
import React, { useState } from 'react';
import { signIn, fetchAuthSession } from '@aws-amplify/auth';
import awsconfig from '../aws-exports';
import { Amplify } from 'aws-amplify';
import {
  Button, TextField, Container, Typography, Box, Paper, Link
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

Amplify.configure(awsconfig);

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Sign in the user
      await signIn({ username, password });

      // Wait for AWS credentials to be available
      const session = await fetchAuthSession();

      if (!session?.credentials || !session.credentials.accessKeyId) {
        throw new Error('Failed to fetch AWS credentials after login.');
      }

      // Now credentials are ready — navigate to chat
      navigate('/chat');
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Sign in to continue chatting!
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
            onClick={handleLogin}
            disabled={loading}
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
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Forgot your password?{' '}
            <Link component={RouterLink} to="/password-reset" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Reset Password
            </Link>
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/signup" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;

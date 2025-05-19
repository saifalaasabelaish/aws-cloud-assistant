// Login.js
import React, { useState } from 'react';
import { signIn, signOut, fetchAuthSession, getCurrentUser } from '@aws-amplify/auth';
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
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Check if there's already a signed in user
      try {
        const user = await getCurrentUser();
        if (user) {
          // Sign out the existing user first
          await signOut();
        }
      } catch (e) {
        // No current user - proceed with login
        console.log('No existing user session');
      }

      // Sign in with the new credentials
      const signInResponse = await signIn({ username, password });
      
      // Verify the session and credentials
      const session = await fetchAuthSession();
      if (!session?.credentials || !session.credentials.accessKeyId) {
        throw new Error('Failed to fetch AWS credentials after login.');
      }

      // Successful login - navigate to chat
      navigate('/chat');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
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

        {error && (
          <Box sx={{ 
            backgroundColor: '#ffebee', 
            p: 2, 
            mb: 2, 
            borderRadius: 1,
            borderLeft: '4px solid #f44336'
          }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}

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
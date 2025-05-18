import React, { useState } from 'react';
import { resetPassword, confirmResetPassword } from 'aws-amplify/auth';
import { Button, TextField, Container, Typography, Box, Paper } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom'; 

function PasswordReset() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [stage, setStage] = useState('request');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRequestCode = async () => {
    try {
      await resetPassword({ username: email });
      setStage('confirm');
      setError('');
    } catch (err) {
      setError('Failed to send code: ' + err.message);
    }
  };

  const handleConfirmReset = async () => {
    try {
      await confirmResetPassword({ username: email, confirmationCode: code, newPassword });
      alert('Password reset successful! Redirecting to Login...');
      navigate('/login');
    } catch (err) {
      setError('Failed to reset password: ' + err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Reset Password
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Enter your email to reset your password.
          </Typography>
        </Box>

        {stage === 'request' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            <Button
              variant="contained"
              onClick={handleRequestCode}
              fullWidth
              sx={{ mt: 2, py: 1.5, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' }, textTransform: 'none' }}
            >
              Send Reset Code
            </Button>
          </Box>
        )}

        {stage === 'confirm' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Verification Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}
              required
            />
            <TextField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}
              required
            />
            <Button
              variant="contained"
              onClick={handleConfirmReset}
              fullWidth
              sx={{ mt: 2, py: 1.5, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' }, textTransform: 'none' }}
            >
              Confirm Reset
            </Button>
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="textSecondary">
            Remember your password?{' '}
            <Link to="/login" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Log In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}

export default PasswordReset;
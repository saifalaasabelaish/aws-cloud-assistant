import React, { useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import Login from './pages/Login';
import Chat from './components/Chat';
import Signup from './pages/Signup';
import PasswordReset from './pages/PasswordReset'; // استيراد المكون الجديد
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

Amplify.configure(awsExports);

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#f50057' },
  },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});

function RedirectToSignup() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/signup');
  }, [navigate]);

  return null;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/password-reset" element={<PasswordReset />} /> {/* مسار جديد */}
          <Route path="/" element={<RedirectToSignup />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
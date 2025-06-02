import React, { useState } from 'react';
import { Box, Paper, TextField, Button, Typography, CircularProgress } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { applicantService } from '../api/services/applicant.service';

export default function OTPVerification() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mobile = searchParams.get('mobile');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !mobile) {
      toast.error('Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      // Call verifyAndSearch API
      const response = await applicantService.verifyAndSearch(mobile, otp);
      toast.success('Mobile number verified successfully');

      if (response.token) {
        // Store the token in localStorage
        localStorage.setItem('authToken', response.token);
      }

      if (response.applicant_id) {
        // Redirect to edit application page if application exists
        navigate(`/apply/edit/${response.applicant_id}?edit=true&verified=true`);
      } else {
        // Redirect to new application page if no application exists
        navigate(`/apply/new?verified=true`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!mobile) return;
    
    try {
      await applicantService.requestMobileSearch(mobile);
      toast.success('OTP resent successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      bgcolor: 'background.default',
      p: 2
    }}>
      <Paper sx={{
        p: 4,
        maxWidth: 400,
        width: '100%',
        borderRadius: 2
      }}>
        <Typography variant="h5" align="center" gutterBottom>
          Verify Your Mobile Number
        </Typography>
        
        <Typography align="center" color="textSecondary" sx={{ mb: 3 }}>
          Please enter the OTP sent to {mobile}
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Enter OTP"
            variant="outlined"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputProps={{ maxLength: 6 }}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading || !otp}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={handleResendOTP}
            disabled={loading}
          >
            Resend OTP
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
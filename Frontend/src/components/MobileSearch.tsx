import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useMutation } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Container,
  Alert,
  AppBar,
  Toolbar,
} from '@mui/material';
import { applicantService } from '../api/services/applicant.service';
import { toast } from 'react-toastify';

export default function MobileSearch() {  
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState('');

  const requestOtpMutation = useMutation(
    (mobile: string) => applicantService.requestMobileSearch(mobile),
    {
      onSuccess: () => {
        toast.success('OTP sent successfully!');
        navigate(`/otp-verification?mobile=${mobileNumber}`);
      },
      onError: (error: any) => {
        setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
        toast.error(error.response?.data?.message || 'Failed to send OTP');
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    requestOtpMutation.mutate(mobileNumber);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      p: 2 
    }}>
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h5" align="center" gutterBottom>
          Enter Mobile Number
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
          Please enter your mobile number to proceed with the application
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Mobile Number"
            value={mobileNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 10);
              setMobileNumber(value);
            }}
            error={!!error}
            helperText={error || 'Enter a 10-digit mobile number'}
            sx={{ mb: 3 }}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
          />
          
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={mobileNumber.length !== 10 || requestOtpMutation.isLoading}
          >
            {requestOtpMutation.isLoading ? <CircularProgress size={24} /> : 'Get OTP'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export function OTPVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mobileNumberFromQuery = searchParams.get('mobile');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  
  const verifyOtpMutation = useMutation(
    async (data: { mobile_number: string; otp: string }) => {
      try {
        const result = await applicantService.verifyAndSearch(data.mobile_number, data.otp);
        return result;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Invalid OTP');
      }
    },
    {
      onSuccess: (data) => {
        if (data && data.applicant_id) {
          toast.success('Application found! Redirecting to edit form...');
          navigate(`/apply/edit/${data.applicant_id}`, { replace: true });
        } else {
          toast.info('No existing application found. Starting new application...');
          navigate(`/apply/new?mobile=${mobileNumberFromQuery}&verified=true`, { replace: true });
        }
      },
      onError: (error: any) => {
        setError(error.message || 'Failed to verify OTP');
        toast.error(error.message || 'Failed to verify OTP');
      }
    }
  );

  const resendOtpMutation = useMutation(
    () => applicantService.requestMobileSearch(mobileNumberFromQuery!),
    {
      onSuccess: () => {
        toast.success('OTP resent successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to resend OTP');
      }
    }
  );

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    if (!mobileNumberFromQuery) {
      setError('Mobile number not found');
      return;
    }
    verifyOtpMutation.mutate({ mobile_number: mobileNumberFromQuery, otp });
  };

  if (!mobileNumberFromQuery) {
    return (
      <Container>
        <Alert severity="error">Mobile number not found. Please try again.</Alert>
        <Button component={Link} to="/apply" sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            OTP Verification
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 4, flex: 1, display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ p: 4, width: '100%' }}>
          <Typography variant="h5" align="center" gutterBottom>
            Enter OTP
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Enter the OTP sent to {mobileNumberFromQuery}
          </Alert>

          <form onSubmit={handleVerifyOtp}>
            <TextField
              fullWidth
              label="Enter OTP"
              variant="outlined"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtp(value);
                setError('');
              }}
              error={!!error}
              helperText={error}
              inputProps={{
                maxLength: 6,
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={verifyOtpMutation.isLoading || otp.length !== 6}
            >
              {verifyOtpMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : (
                'Verify OTP'
              )}
            </Button>

            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="text"
                component={Link}
                to="/apply"
              >
                Change Mobile Number
              </Button>

              <Button
                variant="text"
                onClick={() => resendOtpMutation.mutate()}
                disabled={resendOtpMutation.isLoading}
              >
                {resendOtpMutation.isLoading ? 'Sending...' : 'Resend OTP'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
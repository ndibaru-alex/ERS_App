import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import PersonalInfoForm from './application/PersonalInfoForm';
import DocumentUpload from './application/DocumentUpload';
import ReferenceForm from './application/ReferenceForm';
import EmploymentHistory from './application/EmploymentHistory';
import LanguageForm from './application/LanguageForm';
import MPInformation from './application/MPInformation';
import { applicantService } from '../api/services/applicant.service';
import { useQuery } from 'react-query';

const steps = [
  'Personal Information',
  'Document Upload',
  'Employment History',
  'Languages',
  'MP Information',
  'References'
];

export default function ApplyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verified = searchParams.get('verified') === 'true';
  const mobileFromQuery = searchParams.get('mobile');
  
  const [activeStep, setActiveStep] = useState(0);
  const [temporaryApplicantId, setTemporaryApplicantId] = useState<string | null>(null);
  const [existingApplicantData, setExistingApplicantData] = useState<any>(null);

  // Redirect to mobile search or OTP verification if needed
  useEffect(() => {
    if (!id && !verified && !mobileFromQuery) {
      // Redirect only if no mobile number and not verified
      return; // Stop unnecessary redirection
    }
  }, [id, verified, mobileFromQuery, navigate]);

  // Fetch existing applicant data if editing
  const { data: applicantData, isLoading: isLoadingApplicant } = useQuery(
    ['applicant', id],
    () => applicantService.getById(id!),
    {
      enabled: !!id,
      onSuccess: (data) => {
        setExistingApplicantData(data);
        setTemporaryApplicantId(data.applicant_id);
      },
      onError: () => {
        navigate('/apply', { replace: true });
      }
    }
  );

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePersonalInfoSubmit = (applicantId: string) => {
    setTemporaryApplicantId(applicantId);
    handleNext();
  };

  const handleFinalSubmit = async () => {
    try {
      // Final submission logic here
      navigate('/apply', { replace: true });
    } catch (error) {
      console.error('Error in final submission:', error);
    }
  };

  if (isLoadingApplicant) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderStepContent = () => {
    if (!temporaryApplicantId && activeStep !== 0) {
      return (
        <Typography color="error">
          Please complete the personal information first.
        </Typography>
      );
    }

    switch (activeStep) {
      case 0:
        return <PersonalInfoForm 
          onSubmitSuccess={handlePersonalInfoSubmit} 
          initialMobileNumber={mobileFromQuery || ''} 
          initialData={existingApplicantData}
        />;
      case 1:
        return <DocumentUpload applicantId={temporaryApplicantId!} />;
      case 2:
        return <EmploymentHistory applicantId={temporaryApplicantId!} />;
      case 3:
        return <LanguageForm applicantId={temporaryApplicantId!} />;
      case 4:
        return <MPInformation applicantId={temporaryApplicantId!} />;
      case 5:
        return <ReferenceForm applicantId={temporaryApplicantId!} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1200, mx: 'auto' }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center" color="primary" sx={{ mb: 4 }}>
          {id ? 'Edit Application' : 'Employment Application Form'}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {steps.map((label, index) => (
            <Box key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
              {label}
            </Box>
          ))}
        </Box>

        <Box>
          {renderStepContent()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            
            {activeStep < steps.length - 1 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!temporaryApplicantId && activeStep !== 0}
              >
                Next
              </Button>
            )}

            {activeStep === steps.length - 1 && (
              <Button
                variant="contained"
                color="success"
                onClick={handleFinalSubmit}
              >
                Submit Application
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
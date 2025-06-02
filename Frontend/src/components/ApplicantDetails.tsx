import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import { toast } from 'react-toastify';
import { applicantService } from '../api/services/applicant.service';
import { documentService } from '../api/services/document.service';
import { employmentService } from '../api/services/employment.service';
import { referenceService } from '../api/services/reference.service';
import { languageService } from '../api/services/language.service';
import { mpService } from '../api/services/mp.service';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:3005';

function calculateAge(dateOfBirth: string) {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}

// Helper functions for unit conversion
const metersToInches = (meters: number) => meters * 39.3701;
const kgToLbs = (kg: number) => kg * 2.20462;

function formatHeight(meters: number | null): string {
  if (meters === null || meters === undefined || typeof meters !== 'number') return '-';
  const inches = metersToInches(meters);
  return `${meters.toFixed(2)} m (${inches.toFixed(1)} in)`;
}

function formatWeight(kg: number | null): string {
  if (kg === null || kg === undefined || typeof kg !== 'number') return '-';
  const lbs = kgToLbs(kg);
  return `${kg.toFixed(1)} kg (${lbs.toFixed(1)} lb)`;
}

export default function ApplicantDetails() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: applicant, isLoading: loadingApplicant } = useQuery(['applicant', id], () => applicantService.getById(id!), { enabled: !!id });
  const { data: documents = [] } = useQuery(['documents', id], () => documentService.getApplicantDocuments(id!), { enabled: !!id });
  const { data: employments = [] } = useQuery(['employments', id], () => employmentService.getByApplicant(id!), { enabled: !!id });
  const { data: references = [] } = useQuery(['references', id], () => referenceService.getByApplicant(id!), { enabled: !!id });
  const { data: languages = [] } = useQuery(['languages', id], () => languageService.getByApplicant(id!), { enabled: !!id });
  const { data: mps = [] } = useQuery(['mps', id], () => mpService.getByApplicant(id!), { enabled: !!id });

  const verifyDocumentMutation = useMutation(
    (documentId: string) => documentService.updateStatus(documentId, 'verified'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['documents', id]);
        toast.success('Document verified successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to verify document');
      }
    }
  );

  const verifyEmploymentMutation = useMutation(
    (employmentId: string) => employmentService.verify(employmentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['employments', id]);
        toast.success('Employment record verified');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to verify employment');
      }
    }
  );

  const verifyReferenceMutation = useMutation(
    (referenceId: string) => referenceService.verify(referenceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['references', id]);
        toast.success('Reference verified');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to verify reference');
      }
    }
  );

  if (loadingApplicant) return <div>Loading...</div>;
  if (!applicant) return <div>Applicant not found.</div>;

  const age = calculateAge(applicant.date_of_birth);
  const photoUrl = applicant.photo_url?.startsWith('/uploads') 
    ? `${API_BASE_URL}${applicant.photo_url}`
    : applicant.photo_url;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Applicant Details</Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
          {photoUrl ? (
            <Box
              component="img"
              src={photoUrl}
              alt={`${applicant.first_name} ${applicant.last_name}`}
              sx={{
                width: 200,
                height: 200,
                objectFit: 'cover',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            />
          ) : (
            <Box
              sx={{
                width: 200,
                height: 200,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'grey.100',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography color="text.secondary">No Photo</Typography>
            </Box>
          )}
          
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">Personal Information</Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)'
              },
              gap: 2,
              mt: 1
            }}>
              <Box><b>Name:</b> {applicant.first_name} {applicant.midle_name} {applicant.last_name}</Box>
              <Box><b>Mother's Name:</b> {applicant.mother_name}</Box>
              <Box><b>Date of Birth:</b> {formatDate(applicant.date_of_birth)}</Box>
              <Box><b>Age:</b> {age} years</Box>
              <Box><b>Place of Birth:</b> {applicant.place_of_birth}</Box>
              <Box><b>Gender:</b> {applicant.gender}</Box>
              <Box><b>Email:</b> {applicant.email}</Box>
              <Box><b>Mobile:</b> {applicant.mobile_number}</Box>
              <Box><b>National ID:</b> {applicant.national_id_number}</Box>
              <Box><b>Passport:</b> {applicant.passport_number}</Box>
              <Box><b>Location:</b> {applicant.city_name}, {applicant.region_name}, {applicant.state_name}</Box>
              <Box><b>Marital Status:</b> {applicant.marital_status}</Box>
              <Box><b>Highest Education:</b> {applicant.highest_educ}</Box>
              <Box><b>School Name:</b> {applicant.school_name}</Box>
              <Box><b>Number of Children:</b> {applicant.nbr_of_chil}</Box>
              <Box><b>Live With:</b> {applicant.live_with}</Box>
              <Box><b>Height:</b> {formatHeight(applicant.height)}</Box>
              <Box><b>Weight:</b> {formatWeight(applicant.weight)}</Box>
              <Box><b>Employment Status:</b> {applicant.emp_status}</Box>
              <Box><b>Been to Qatar:</b> {applicant.being_qatar || 'N/A'}</Box>
              {applicant.being_qatar === 'yes' && (
                <Box><b>Arrested in Qatar:</b> {applicant.arrest_qatar || 'N/A'}</Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Language Proficiency</Typography>
        {languages.length === 0 ? (
          <Typography color="text.secondary">No language information available.</Typography>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 2
          }}>
            {languages.map((lang: any) => (
              <Box
                key={lang.id}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: 'background.paper'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  {lang.language}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Proficiency: {lang.level}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>MP Information</Typography>
        {mps.length === 0 ? (
          <Typography color="text.secondary">No MP information available.</Typography>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 2
          }}>
            {mps.map((mp: any) => (
              <Box
                key={mp.mp_id}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  backgroundColor: 'background.paper'
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  {mp.mp_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {mp.mp_type}
                </Typography>
                {mp.mobile && (
                  <Typography variant="body2" color="text.secondary">
                    Mobile: {mp.mobile}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  State: {mp.state_name}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Documents</Typography>
        {documents.length === 0 ? <Typography>No documents uploaded.</Typography> : (
          <Stack spacing={2}>
            {documents.map((doc: any) => {
              const fileUrl = doc.file_url.startsWith('/uploads')
                ? `${API_BASE_URL}${doc.file_url}`
                : doc.file_url;
              return (
                <Box key={doc.document_id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                  <Box>
                    <Typography variant="subtitle1">{doc.document_type.replace(/_/g, ' ').toUpperCase()}</Typography>
                    <Typography variant="body2" color="text.secondary">Status: {doc.status}</Typography>
                    {doc.remarks && <Typography variant="body2">Remarks: {doc.remarks}</Typography>}
                    <Button size="small" href={fileUrl} target="_blank" sx={{ mt: 1 }}>View Document</Button>
                  </Box>
                  {doc.status !== 'verified' && (
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small"
                      onClick={() => verifyDocumentMutation.mutate(doc.document_id)}
                    >
                      Verify
                    </Button>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">Employment History</Typography>
        {employments.length === 0 ? <Typography>No employment records.</Typography> : (
          <Stack spacing={2}>
            {employments.map((emp: any) => (
              <Box key={emp.employment_id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Box>
                  <Typography variant="subtitle1">{emp.job_title} at {emp.employer_name}</Typography>
                  <Typography variant="body2">{emp.city_name}, {emp.region_name}, {emp.state_name}</Typography>
                  <Typography variant="body2">{emp.start_date} - {emp.end_date || 'Present'}</Typography>
                  {emp.contact_name && <Typography variant="body2">Contact: {emp.contact_name}</Typography>}
                  <Typography variant="body2" color="text.secondary">Status: {emp.emp_verified === '1' ? 'Verified' : 'Unverified'}</Typography>
                </Box>
                {emp.emp_verified !== '1' && (
                  <Button 
                    variant="contained" 
                    color="success" 
                    size="small"
                    onClick={() => verifyEmploymentMutation.mutate(emp.employment_id)}
                  >
                    Verify
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6">References</Typography>
        {references.length === 0 ? <Typography>No references.</Typography> : (
          <Stack spacing={2}>
            {references.map((ref: any) => (
              <Box key={ref.applic_ref_id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                <Box>
                  <Typography variant="subtitle1">{ref.full_name}</Typography>
                  <Typography variant="body2">{ref.ref_relationship}</Typography>
                  <Typography variant="body2">{ref.city_name}, {ref.region_name}, {ref.state_name}</Typography>
                  <Typography variant="body2">Mobile: {ref.mobile_number || '-'}</Typography>
                  <Typography variant="body2">National ID: {ref.national_id_number || '-'}</Typography>
                  <Typography variant="body2">Passport: {ref.passport_number || '-'}</Typography>
                  <Typography variant="body2">Is Grantor: {ref.is_grantor === '1' ? 'Yes' : 'No'}</Typography>
                  <Typography variant="body2" color="text.secondary">Status: {ref.ref_verified === '1' ? 'Verified' : 'Unverified'}</Typography>
                </Box>
                {ref.ref_verified !== '1' && (
                  <Button 
                    variant="contained" 
                    color="success" 
                    size="small"
                    onClick={() => verifyReferenceMutation.mutate(ref.applic_ref_id)}
                  >
                    Verify
                  </Button>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { toast } from 'react-toastify';
import { mpService, type MPType } from '../../api/services/mp.service';
import { stateService } from '../../api/services/state.service';

interface MPInformationProps {
  applicantId: string;
}

interface MP {
  mp_id?: number;
  mp_name: string;
  mobile?: string;
  state_id: number;
  state_name?: string;
  mp_type: MPType;
}

export default function MPInformation({ applicantId }: MPInformationProps) {
  const queryClient = useQueryClient();
  const [currentMP, setCurrentMP] = useState<MP>({
    mp_name: '',
    mobile: '',
    state_id: 0,
    mp_type: '' as MPType
  });
  
  // Fetch states for dropdown
  const { data: states = [], isLoading: statesLoading, error: statesError } = useQuery(
    'states',
    stateService.getAll
  );

  console.log('Fetched states:', states);

  // Fetch existing MPs for this applicant
  const { data: mps = [], isLoading: mpsLoading } = useQuery(
    ['mps', applicantId],
    () => mpService.getByApplicant(applicantId),
    {
      onError: (error: any) => {
        console.error('Error loading MPs:', error);
        toast.error('Failed to load MP information');
      }
    }
  );

  // MP creation mutation
  const createMutation = useMutation(
    (data: Omit<MP, 'mp_id' | 'state_name'> & { applicant_id: string }) => mpService.create({
      ...data,
      applicant_id: applicantId
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mps', applicantId]);
        toast.success('MP added successfully');
        setCurrentMP({
          mp_name: '',
          mobile: '',
          state_id: 0,
          mp_type: '' as MPType
        });
      },
      onError: (error: any) => {
        console.error('Error creating MP:', error);
        toast.error(error.response?.data?.message || 'Failed to add MP');
      }
    }
  );

  // MP deletion mutation
  const deleteMutation = useMutation(
    (mpId: number) => mpService.delete(mpId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['mps', applicantId]);
        toast.success('MP removed successfully');
      },
      onError: (error: any) => {
        console.error('Error deleting MP:', error);
        toast.error(error.response?.data?.message || 'Failed to remove MP');
      }
    }
  );

  const handleAddMP = () => {
    if (!currentMP.mp_name || !currentMP.mp_type || !currentMP.state_id) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Submit MP information to backend
    createMutation.mutate({
      mp_name: currentMP.mp_name,
      mobile: currentMP.mobile || undefined,
      state_id: currentMP.state_id,
      mp_type: currentMP.mp_type,
      applicant_id: applicantId
    });
  };

  const handleDeleteMP = (mpId: number) => {
    if (window.confirm('Are you sure you want to delete this MP?')) {
      deleteMutation.mutate(mpId);
    }
  };

  const resetForm = () => {
    setCurrentMP({
      mp_name: '',
      mobile: '',
      state_id: 0, 
      mp_type: '' as MPType
    });
  };

  if (statesLoading || mpsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (statesError) {
    return (
      <Typography color="error">Failed to load states. Please try again later.</Typography>
    );
  }

  // Prepare state options (using service data with id and state_name)
  const validStates = Array.isArray(states)
    ? states.map((state: any) => ({ state_id: Number(state.id), state_name: state.state_name }))
    : [];

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          MP Information
        </Typography>
        
        {/* Display MP details before state selection */}
        {mps.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Existing MPs
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {mps.map((mp: any) => (
                <Chip
                  key={mp.mp_id}
                  label={`${mp.mp_name} (${mp.mp_type}, ${mp.mobile || 'No Mobile'})`}
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
        )}
        
        {/* Always show MP form fields, regardless of state selection */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              MP Details
            </Typography>
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)'
              },
              gap: 2,
              mt: 2
            }}>
              <TextField
                fullWidth
                required
                label="MP Name"
                value={currentMP.mp_name}
                onChange={(e) => setCurrentMP({ ...currentMP, mp_name: e.target.value })}
              />
              <FormControl fullWidth required>
                <InputLabel>MP Type</InputLabel>
                <Select
                  value={currentMP.mp_type}
                  onChange={(e) => setCurrentMP({ ...currentMP, mp_type: e.target.value as MPType })}
                  label="MP Type"
                >
                  <MenuItem value="federal">Federal</MenuItem>
                  <MenuItem value="state">State</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Mobile Number"
                value={currentMP.mobile || ''}
                onChange={(e) => setCurrentMP({ ...currentMP, mobile: e.target.value })}
              />
              <FormControl fullWidth required>
                <InputLabel>State</InputLabel>
                <Select
                  value={currentMP.state_id?.toString() || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setCurrentMP((prev) => ({ ...prev, state_id: Number(selectedId) }));
                  }}
                  label="State"
                >
                  {validStates.map((state: any) => (
                    <MenuItem key={state.state_id} value={state.state_id.toString()}>
                      {state.state_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ gridColumn: '1 / -1', mt: 1, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleAddMP}
                  disabled={!currentMP.mp_name || !currentMP.mp_type || !currentMP.state_id || createMutation.isLoading}
                >
                  {createMutation.isLoading ? 'Adding...' : 'Add MP'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetForm}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />
        
        {/* Display added MPs only if there are any */}
        {mps && mps.length > 0 && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {mps.map((mp: any) => (
              <Chip
                key={mp.mp_id}
                label={`${mp.mp_name} (${mp.mp_type}, ${mp.state_name || 'Unknown state'})`}
                onDelete={() => handleDeleteMP(mp.mp_id)}
                color="primary"
                variant="outlined"
                disabled={deleteMutation.isLoading}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
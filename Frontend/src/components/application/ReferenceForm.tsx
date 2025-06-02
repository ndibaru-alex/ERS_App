import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { referenceService } from '../../api/services/reference.service';
import { stateService } from '../../api/services/state.service';
import { regionService } from '../../api/services/region.service';
import { cityService } from '../../api/services/city.service';
import { toast } from 'react-toastify';

const RELATIONSHIPS = [
  'Supervisor',
  'Colleague',
  'Friend',
  'Family',
  'Other'
];

export default function ReferenceForm({ applicantId }: { applicantId: string }) {
  const queryClient = useQueryClient();
  const [selectedState, setSelectedState] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [currentReference, setCurrentReference] = useState({
    full_name: '',
    ref_relationship: '',
    is_grantor: '0',
    city_id: 0,
    mobile_number: '',
    national_id_number: '',
    passport_number: ''
  });

  // Fetch location data
  const { data: states = [] } = useQuery('states', stateService.getAll);
  const { data: regions = [] } = useQuery(
    ['regions', selectedState],
    () => selectedState ? regionService.getByState(selectedState) : [],
    { enabled: !!selectedState }
  );
  const { data: cities = [] } = useQuery(
    ['cities', selectedRegion],
    () => selectedRegion ? cityService.getByRegion(selectedRegion) : [],
    { enabled: !!selectedRegion }
  );

  // Fetch references
  const { data: references = [] } = useQuery(
    ['references', applicantId],
    () => referenceService.getByApplicant(applicantId),
    { enabled: !!applicantId }
  );

  // Add reference mutation
  const createMutation = useMutation(
    (data: any) => {
      const formattedData = {
        ...data,
        applicant_id: applicantId,
        city_id: Number(data.city_id),  // Ensure city_id is a number
        is_grantor: data.is_grantor || '0',
        ref_verified: '0'
      };
      return referenceService.create(formattedData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['references', applicantId]);
        toast.success('Reference added successfully');
        setCurrentReference({
          full_name: '',
          ref_relationship: '',
          is_grantor: '0',
          city_id: 0,
          mobile_number: '',
          national_id_number: '',
          passport_number: ''
        });
        setSelectedState('');
        setSelectedRegion('');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add reference');
      }
    }
  );

  // Delete reference mutation
  const deleteMutation = useMutation(
    (referenceId: string) => referenceService.delete(referenceId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['references', applicantId]);
        toast.success('Reference deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete reference');
      }
    }
  );

  const handleAddReference = () => {
    if (!currentReference.full_name || !currentReference.ref_relationship || !currentReference.city_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const formData = {
      ...currentReference,
      applicant_id: applicantId,
      city_id: Number(currentReference.city_id)
    };
    
    createMutation.mutate(formData);
  };

  const handleRemoveReference = (referenceId: string) => {
    if (window.confirm('Are you sure you want to delete this reference?')) {
      deleteMutation.mutate(referenceId);
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Reference
        </Typography>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          gap: 3
        }}>
          <TextField
            fullWidth
            required
            label="Full Name"
            value={currentReference.full_name}
            onChange={(e) => setCurrentReference({ ...currentReference, full_name: e.target.value })}
          />
          <FormControl fullWidth required>
            <InputLabel>Relationship</InputLabel>
            <Select
              value={currentReference.ref_relationship}
              onChange={(e) => setCurrentReference({ ...currentReference, ref_relationship: e.target.value })}
              label="Relationship"
            >
              {RELATIONSHIPS.map((rel) => (
                <MenuItem key={rel} value={rel}>{rel}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>State</InputLabel>
            <Select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedRegion('');
                setCurrentReference({ ...currentReference, city_id: 0 });
              }}
              label="State"
            >
              {states.map((state: any) => (
                <MenuItem key={state.id} value={state.id}>{state.state_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Region</InputLabel>
            <Select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setCurrentReference({ ...currentReference, city_id: 0 });
              }}
              label="Region"
              disabled={!selectedState}
            >
              {regions.map((region: any) => (
                <MenuItem key={region.id} value={region.id}>{region.region_name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>City</InputLabel>
            <Select
              value={currentReference.city_id}
              onChange={(e) => setCurrentReference({ ...currentReference, city_id: Number(e.target.value) })}
              label="City"
              disabled={!selectedRegion}
            >
              {cities.map((city: any) => (
                <MenuItem key={city.id} value={city.id}>{city.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Mobile Number"
            value={currentReference.mobile_number}
            onChange={(e) => setCurrentReference({ ...currentReference, mobile_number: e.target.value })}
          />
          <TextField
            fullWidth
            label="National ID Number"
            value={currentReference.national_id_number}
            onChange={(e) => setCurrentReference({ ...currentReference, national_id_number: e.target.value })}
          />
          <TextField
            fullWidth
            label="Passport Number"
            value={currentReference.passport_number}
            onChange={(e) => setCurrentReference({ ...currentReference, passport_number: e.target.value })}
          />
          <FormControl fullWidth>
            <InputLabel>Is Grantor?</InputLabel>
            <Select
              value={currentReference.is_grantor}
              onChange={(e) => setCurrentReference({ ...currentReference, is_grantor: e.target.value })}
              label="Is Grantor?"
            >
              <MenuItem value={'1'}>Yes</MenuItem>
              <MenuItem value={'0'}>No</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Button
              variant="contained"
              onClick={handleAddReference}
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? 'Adding...' : 'Add Reference'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {references.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            References List
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr'
            },
            gap: 2
          }}>
            {references.map((ref: any) => (
              <Card variant="outlined" key={ref.applic_ref_id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {ref.full_name}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        {ref.ref_relationship}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Location: {ref.city_name}, {ref.region_name}, {ref.state_name}
                      </Typography>
                      <Typography variant="body2">
                        Mobile: {ref.mobile_number || '-'}
                      </Typography>
                      <Typography variant="body2">
                        National ID: {ref.national_id_number || '-'}
                      </Typography>
                      <Typography variant="body2">
                        Passport: {ref.passport_number || '-'}
                      </Typography>
                      <Typography variant="body2">
                        Is Grantor: {ref.is_grantor === '1' ? 'Yes' : 'No'}
                      </Typography>
                      <Typography variant="body2">
                        Verified: {ref.ref_verified === '1' ? 'Yes' : 'No'}
                      </Typography>
                    </Box>
                    <IconButton onClick={() => handleRemoveReference(ref.applic_ref_id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
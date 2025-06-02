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
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { employmentService } from '../../api/services/employment.service';
import { stateService } from '../../api/services/state.service';
import { regionService } from '../../api/services/region.service';
import { cityService } from '../../api/services/city.service';

interface EmploymentHistoryProps {
  applicantId: string;
}

interface Employment {
  employer_name: string;
  city_id: number;
  job_title: string;
  start_date: Date | null;
  end_date: Date | null;
  contact_name: string;
}

export default function EmploymentHistory({ applicantId }: EmploymentHistoryProps) {
  const queryClient = useQueryClient();
  const [selectedState, setSelectedState] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [currentEmployment, setCurrentEmployment] = useState<Employment>({
    employer_name: '',
    city_id: 0,
    job_title: '',
    start_date: null,
    end_date: null,
    contact_name: '',
  });

  // Fetch employment history
  const { data: employments = [], isLoading } = useQuery(
    ['employments', applicantId],
    () => employmentService.getByApplicant(applicantId)
  );
  console.log('Employment history for applicantId', applicantId, employments);

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

  // Mutations
  const createMutation = useMutation(
    (data: Employment) => employmentService.create(applicantId, {
      ...data,
      start_date: data.start_date?.toISOString().split('T')[0] || '',
      end_date: data.end_date?.toISOString().split('T')[0],
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['employments', applicantId]);
        toast.success('Employment record added successfully');
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add employment record');
      }
    }
  );

  const deleteMutation = useMutation(
    (employmentId: string) => employmentService.delete(employmentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['employments', applicantId]);
        toast.success('Employment record deleted successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete employment record');
      }
    }
  );

  const resetForm = () => {
    setCurrentEmployment({
      employer_name: '',
      city_id: 0,
      job_title: '',
      start_date: null,
      end_date: null,
      contact_name: '',
    });
    setSelectedState('');
    setSelectedRegion('');
  };

  const handleSubmit = () => {
    if (!currentEmployment.employer_name || !currentEmployment.job_title || 
        !currentEmployment.start_date || !currentEmployment.city_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    createMutation.mutate(currentEmployment);
  };

  const handleDelete = (employmentId: string) => {
    if (window.confirm('Are you sure you want to delete this employment record?')) {
      deleteMutation.mutate(employmentId);
    }
  };

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedRegion('');
    setCurrentEmployment({ ...currentEmployment, city_id: 0 });
  };

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    setCurrentEmployment({ ...currentEmployment, city_id: 0 });
  };

  if (isLoading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      {/* Show employment history first */}
      {employments.length > 0 ? (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Employment History
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr'
            },
            gap: 2
          }}>
            {employments.map((emp: any) => (
              <Card variant="outlined" key={emp.employment_id}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6">
                        {emp.job_title} at {emp.employer_name}
                      </Typography>
                      <Typography color="textSecondary">
                        {new Date(emp.start_date).toLocaleDateString()} - {
                          emp.end_date ? new Date(emp.end_date).toLocaleDateString() : 'Present'
                        }
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Location: {emp.city_name}, {emp.region_name}, {emp.state_name}
                      </Typography>
                      {emp.contact_name && (
                        <Typography variant="body2">
                          Contact: {emp.contact_name}
                        </Typography>
                      )}
                    </Box>
                    <IconButton 
                      onClick={() => handleDelete(emp.employment_id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Paper>
      ) : (
        <Typography sx={{ mb: 2 }} color="text.secondary">
          No employment history found. Add your first employment record below.
        </Typography>
      )}

      {/* Add Employment form below */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Employment
        </Typography>
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(2, 1fr)'
          },
          gap: 3
        }}>
          <TextField
            fullWidth
            required
            label="Employer Name"
            value={currentEmployment.employer_name}
            onChange={(e) => setCurrentEmployment({
              ...currentEmployment,
              employer_name: e.target.value
            })}
          />
          <TextField
            fullWidth
            required
            label="Job Title"
            value={currentEmployment.job_title}
            onChange={(e) => setCurrentEmployment({
              ...currentEmployment,
              job_title: e.target.value
            })}
          />

          <FormControl fullWidth required>
            <InputLabel>State</InputLabel>
            <Select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              label="State"
            >
              {states.map((state: any) => (
                <MenuItem key={state.id} value={state.id}>
                  {state.state_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Region</InputLabel>
            <Select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
              label="Region"
              disabled={!selectedState}
            >
              {regions.map((region: any) => (
                <MenuItem key={region.id} value={region.id}>
                  {region.region_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>City</InputLabel>
            <Select
              value={currentEmployment.city_id}
              onChange={(e) => setCurrentEmployment({
                ...currentEmployment,
                city_id: Number(e.target.value)
              })}
              label="City"
              disabled={!selectedRegion}
            >
              {cities.map((city: any) => (
                <MenuItem key={city.id} value={city.id}>
                  {city.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' }, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={currentEmployment.start_date}
                onChange={(date) => setCurrentEmployment({
                  ...currentEmployment,
                  start_date: date
                })}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={currentEmployment.end_date}
                onChange={(date) => setCurrentEmployment({
                  ...currentEmployment,
                  end_date: date
                })}
                sx={{ width: '100%' }}
              />
            </LocalizationProvider>
          </Box>

          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
            <TextField
              fullWidth
              label="Contact Person"
              value={currentEmployment.contact_name}
              onChange={(e) => setCurrentEmployment({
                ...currentEmployment,
                contact_name: e.target.value
              })}
              helperText="Name of supervisor or HR contact"
            />
          </Box>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? 'Adding...' : 'Add Employment'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
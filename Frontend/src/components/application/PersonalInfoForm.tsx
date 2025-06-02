import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { applicantService } from '../../api/services/applicant.service';
import { stateService } from '../../api/services/state.service';
import { regionService } from '../../api/services/region.service';
import { cityService } from '../../api/services/city.service';
import { documentService } from '../../api/services/document.service';

interface FormData {
  first_name: string;
  midle_name: string;
  last_name: string;
  mother_name: string;
  date_of_birth: string | undefined;
  place_of_birth: string;
  gender: string;
  email: string;
  mobile_number: string;
  national_id_number: string;
  passport_number: string;
  city_id: string;
  photo_url: string;
  marital_status: string;
  highest_educ: string;
  school_name: string;
  nbr_of_chil: string | undefined;
  live_with: string;
  emp_status: string;
  app_status: string;
  height: string | undefined;
  weight: string | undefined;
  state_id?: string;
  region_id?: string;
  applicant_id?: string;
  being_qatar?: string;
  arrest_qatar?: string;
}

interface PersonalInfoFormProps {
  onSubmitSuccess: (applicantId: string) => void;
  initialData?: Partial<FormData>;
  initialMobileNumber?: string;
}

export default function PersonalInfoForm({ onSubmitSuccess, initialData, initialMobileNumber }: PersonalInfoFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    midle_name: '',
    last_name: '',
    mother_name: '',
    date_of_birth: undefined,
    place_of_birth: '',
    gender: '',
    email: '',
    mobile_number: initialMobileNumber || '',
    national_id_number: '',
    passport_number: '',
    city_id: '',
    photo_url: '',
    marital_status: '',
    highest_educ: '',
    school_name: '',
    nbr_of_chil: undefined,
    live_with: '',
    emp_status: '',
    app_status: 'submitted',
    height: undefined,
    weight: undefined,
    being_qatar: '',
    arrest_qatar: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        first_name: initialData.first_name || '',
        midle_name: initialData.midle_name || '',
        last_name: initialData.last_name || '',
        mother_name: initialData.mother_name || '',
        date_of_birth: initialData.date_of_birth ? new Date(initialData.date_of_birth).toISOString().split('T')[0] : undefined,
        place_of_birth: initialData.place_of_birth || '',
        gender: initialData.gender || '',
        email: initialData.email || '',
        mobile_number: initialData.mobile_number || initialMobileNumber || '',
        national_id_number: initialData.national_id_number || '',
        passport_number: initialData.passport_number || '',
        marital_status: initialData.marital_status || '',
        highest_educ: initialData.highest_educ || '',
        school_name: initialData.school_name || '',
        height: initialData.height?.toString() || undefined,
        weight: initialData.weight?.toString() || undefined,
        nbr_of_chil: initialData.nbr_of_chil || undefined,
        live_with: initialData.live_with || '',
        city_id: initialData.city_id?.toString() || '',
        being_qatar: initialData.being_qatar || '',
        arrest_qatar: initialData.arrest_qatar || '',
      }));

      if (initialData.state_id) {
        setSelectedState(initialData.state_id.toString());
      }
      if (initialData.region_id) {
        setSelectedRegion(initialData.region_id.toString());
      }
    }
  }, [initialData, initialMobileNumber]);

  const { data: states = [], isLoading: statesLoading } = useQuery('states', stateService.getAll);

  const { data: regions = [], isLoading: regionsLoading } = useQuery(
    ['regions', selectedState],
    () => (selectedState ? regionService.getByState(selectedState) : []),
    { enabled: !!selectedState }
  );

  const { data: cities = [], isLoading: citiesLoading } = useQuery(
    ['cities', selectedRegion],
    () => (selectedRegion ? cityService.getByRegion(selectedRegion) : []),
    { enabled: !!selectedRegion }
  );

  const createMutation = useMutation(applicantService.create, {
    onSuccess: (response) => {
      if (response && response.applicant_id) {
        toast.success('Personal information saved successfully!');
        onSubmitSuccess(response.applicant_id);
      } else {
        console.error('Unexpected response structure:', response);
        toast.error('Failed to save personal information. Please try again.');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save personal information');
    },
  });

  const handleStateChange = (stateId: string) => {
    setSelectedState(stateId);
    setSelectedRegion('');
    setFormData((prev) => ({ ...prev, city_id: '' }));
  };

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId);
    setFormData((prev) => ({ ...prev, city_id: '' }));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const data = await documentService.uploadFile(file);
        setFormData((prev) => ({ ...prev, photo_url: data.file_url }));
      } catch (error) {
        toast.error('Failed to upload photo');
        console.error('Upload error:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.first_name || !formData.last_name || !formData.mobile_number) {
      toast.error('Please fill in all required fields');
      return;
    }

    const height = formData.height ? parseFloat(formData.height) : undefined;
    const weight = formData.weight ? parseFloat(formData.weight) : undefined;
    const nbr_of_chil = formData.nbr_of_chil ? parseInt(formData.nbr_of_chil, 10) : undefined;

    const submitData = {
      ...formData,
      height,
      weight,
      nbr_of_chil,
      city_id: parseInt(formData.city_id, 10),
      date_of_birth: formData.date_of_birth || '',
    };

    try {
      let response;
      if (initialData?.applicant_id) {
        response = await applicantService.update(initialData.applicant_id, submitData);
        toast.success('Application updated successfully');
      } else {
        response = await applicantService.create(submitData);
        toast.success('Personal information saved successfully');
      }
      onSubmitSuccess(response.applicant_id || initialData?.applicant_id);
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Failed to save personal information');
    }
  };

  if (statesLoading) return <div>Loading...</div>;

  return (
    <Box sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 'medium' }}>
              Personal Information
            </Typography>
          </Box>

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
            <TextField
              fullWidth
              required
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
            <TextField
              fullWidth
              required
              label="Middle Name"
              value={formData.midle_name}
              onChange={(e) => setFormData({ ...formData, midle_name: e.target.value })}
            />
            <TextField
              fullWidth
              required
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
            <TextField
              fullWidth
              required
              label="Mother's Name"
              value={formData.mother_name}
              onChange={(e) => setFormData({ ...formData, mother_name: e.target.value })}
            />
            <TextField
              fullWidth
              required
              type="date"
              label="Date of Birth"
              value={formData.date_of_birth || ''}
              onChange={(e) => {
                const date = e.target.value;
                setFormData({ ...formData, date_of_birth: date });
              }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              label="Place of Birth"
              value={formData.place_of_birth}
              onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                label="Gender"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              type="email"
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <TextField
              fullWidth
              label="Mobile Number"
              value={formData.mobile_number}
              onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
            />
            <TextField
              fullWidth
              label="National ID Number"
              value={formData.national_id_number}
              onChange={(e) => setFormData({ ...formData, national_id_number: e.target.value })}
            />
            <TextField
              fullWidth
              label="Passport Number"
              value={formData.passport_number}
              onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <TextField
              fullWidth
              label="Photo"
              value={formData.photo_url ? 'Photo selected' : ''}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Button
                    variant="contained"
                    onClick={() => fileInputRef.current?.click()}
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    Browse
                  </Button>
                ),
              }}
            />
            {formData.photo_url && (
              <Box sx={{ mt: 1, textAlign: 'center' }}>
                <img
                  src={formData.photo_url}
                  alt="Selected"
                  style={{
                    maxWidth: '100px',
                    maxHeight: '100px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
              </Box>
            )}
            <FormControl fullWidth required>
              <InputLabel>Marital Status</InputLabel>
              <Select
                value={formData.marital_status}
                onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                label="Marital Status"
              >
                <MenuItem value="single">Single</MenuItem>
                <MenuItem value="married">Married</MenuItem>
                <MenuItem value="divorced">Divorced</MenuItem>
                <MenuItem value="widowed">Widowed</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Highest Education</InputLabel>
              <Select
                value={formData.highest_educ}
                onChange={(e) => setFormData({ ...formData, highest_educ: e.target.value })}
                label="Highest Education"
              >
                <MenuItem value="elementary">Elementary</MenuItem>
                <MenuItem value="highschool">High School</MenuItem>
                <MenuItem value="vocational">Vocational/Technical</MenuItem>
                <MenuItem value="bachelors">Bachelor's Degree</MenuItem>
                <MenuItem value="masters">Master's Degree</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="School Name"
              value={formData.school_name}
              onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
              placeholder="Enter your school/university name"
            />
            <TextField
              fullWidth
              label="Height in Meters"
              value={formData.height || ''}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            />
            <TextField
              fullWidth
              label="Weight in Kilograms"
              value={formData.weight || ''}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
            <TextField
              fullWidth
              label="Number of Children"
              type="number"
              value={formData.nbr_of_chil || ''}
              onChange={(e) => setFormData({ ...formData, nbr_of_chil: e.target.value })}
            />
            <FormControl fullWidth required>
              <InputLabel>Live With</InputLabel>
              <Select
                value={formData.live_with}
                onChange={(e) => setFormData({ ...formData, live_with: e.target.value })}
                label="Live With"
              >
                <MenuItem value="spouse">Spouse</MenuItem>
                <MenuItem value="parents">Parents</MenuItem>
                <MenuItem value="alone">Alone</MenuItem>
                <MenuItem value="children">Children</MenuItem>
                <MenuItem value="relatives">Relatives</MenuItem>
                <MenuItem value="others">Others</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Have you been to Qatar?</InputLabel>
              <Select
                name="being_qatar"
                value={formData.being_qatar}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData((prev) => {
                    const updatedFormData = { ...prev, being_qatar: value };
                    if (value === 'no') {
                      updatedFormData.arrest_qatar = '';
                    }
                    return updatedFormData;
                  });
                }}
                required
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </FormControl>
            {formData.being_qatar === 'yes' && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Have you been arrested in Qatar?</InputLabel>
                <Select
                  name="arrest_qatar"
                  value={formData.arrest_qatar}
                  onChange={(e) => setFormData({ ...formData, arrest_qatar: e.target.value })}
                  required
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>

          <Box sx={{ mt: 4, mb: 2, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
              Location Information
            </Typography>
          </Box>

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
            <FormControl fullWidth>
              <InputLabel>State</InputLabel>
              <Select
                required
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

            <FormControl fullWidth>
              <InputLabel>Region</InputLabel>
              <Select
                required
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                label="Region"
                disabled={!selectedState || regionsLoading}
              >
                {regions.map((region: any) => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.region_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>City</InputLabel>
              <Select
                required
                value={formData.city_id}
                onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                label="City"
                disabled={!selectedRegion || citiesLoading}
              >
                {cities.map((city: any) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={createMutation.isLoading}
            >
              {createMutation.isLoading ? 'Saving...' : 'Save & Continue'}
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
}
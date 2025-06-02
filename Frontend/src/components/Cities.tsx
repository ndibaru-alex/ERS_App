import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { toast } from 'react-toastify';
import { cityService } from '../api/services/city.service';
import { stateService } from '../api/services/state.service';
import { regionService } from '../api/services/region.service';

export default function Cities() {
  const [open, setOpen] = useState(false);
  const [editingCity, setEditingCity] = useState<any>(null);
  const [formData, setFormData] = useState({ city_name: '', regionId: '' });
  const [selectedState, setSelectedState] = useState('');
  const queryClient = useQueryClient();

  const { data: cities = [], isLoading: citiesLoading } = useQuery('cities', cityService.getAll, {
    onError: (error: any) => {
      console.error('Error loading cities:', error);
      toast.error('Failed to load cities');
    }
  });

  const { data: states = [], isLoading: statesLoading } = useQuery('states', stateService.getAll, {
    onError: (error: any) => {
      console.error('Error loading states:', error);
      toast.error('Failed to load states');
    }
  });

  const { data: filteredRegions = [], isLoading: regionsLoading } = useQuery(
    ['regions', selectedState],
    () => selectedState ? regionService.getByState(selectedState) : [],
    {
      enabled: !!selectedState,
      onError: (error: any) => {
        console.error('Error loading regions:', error);
        toast.error('Failed to load regions');
      }
    }
  );

  const createMutation = useMutation(cityService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('cities');
      toast.success('City created successfully');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Create city error:', error);
      toast.error(error.response?.data?.message || 'Failed to create city');
    }
  });

  const updateMutation = useMutation(
    (data: { id: string; data: any }) => cityService.update(Number(data.id), data.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cities');
        toast.success('City updated successfully');
        handleClose();
      },
      onError: (error: any) => {
        console.error('Update city error:', error);
        toast.error(error.response?.data?.message || 'Failed to update city');
      }
    }
  );

  const deleteMutation = useMutation(cityService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('cities');
      toast.success('City deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete city error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete city');
    }
  });

  const handleOpen = (city?: any) => {
    if (city) {
      console.log('Opening edit with city:', city);
      setEditingCity(city);
      setSelectedState(city.state_id);
      setFormData({ city_name: city.city_name, regionId: city.regionId });
    } else {
      setEditingCity(null);
      setSelectedState('');
      setFormData({ city_name: '', regionId: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCity(null);
    setFormData({ city_name: '', regionId: '' });
    setSelectedState('');
  };

  const handleStateChange = (stateId: string) => {
    console.log('State selected:', stateId);
    setSelectedState(stateId);
    setFormData(prev => ({ ...prev, regionId: '' }));
  };

  const handleRegionChange = (regionId: string) => {
    console.log('Region selected:', regionId);
    setFormData(prev => ({ ...prev, regionId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);

    if (!formData.city_name || !formData.regionId || !selectedState) {
      toast.error('City name, region, and state are required');
      return;
    }

    if (editingCity) {
      updateMutation.mutate({
        id: editingCity.id,
        data: {
          city_name: formData.city_name,
          region_id: Number(formData.regionId),
          state_id: Number(selectedState) // Added state_id to match the required type
        }
      });
    } else {
      createMutation.mutate({
        city_name: formData.city_name,
        region_id: Number(formData.regionId),
        state_id: Number(selectedState) // Added state_id to match the required type
      });
    }
  };

  if (citiesLoading || statesLoading) return <div>Loading...</div>;

  return (
    <>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Add New City
      </Button>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Region</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cities.map((city: any) => (
              <TableRow key={city.id}>
                <TableCell>{city.city_name}</TableCell>
                <TableCell>{city.region_name || 'N/A'}</TableCell>
                <TableCell>{city.state_name || 'N/A'}</TableCell>
                <TableCell>
                  <Button onClick={() => handleOpen(city)}>Edit</Button>
                  <Button 
                    color="error"
                    onClick={() => deleteMutation.mutate(city.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingCity ? 'Edit City' : 'Add New City'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              margin="normal"
              value={formData.city_name}
              onChange={(e) => setFormData({ ...formData, city_name: e.target.value })}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>State</InputLabel>
              <Select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                required
                label="State"
              >
                {states.map((state: any) => (
                  <MenuItem key={state.id} value={state.id}>
                    {state.state_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Region</InputLabel>
              <Select
                value={formData.regionId}
                onChange={(e) => handleRegionChange(e.target.value)}
                required
                label="Region"
                disabled={!selectedState || regionsLoading}
              >
                {filteredRegions.map((region: any) => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.region_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button 
              type="submit"
              variant="contained"
              disabled={createMutation.isLoading || updateMutation.isLoading}
            >
              {createMutation.isLoading || updateMutation.isLoading ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}
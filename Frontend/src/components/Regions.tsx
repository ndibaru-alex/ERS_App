import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Select, MenuItem, FormControl, InputLabel, Box
} from '@mui/material';
import { toast } from 'react-toastify';
import { regionService } from '../api/services/region.service';
import { stateService } from '../api/services/state.service';

export default function Regions() {
  const [open, setOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', stateId: '' });
  const queryClient = useQueryClient();

  // Query both regions and states with enabled logging
  const { data: regions, isLoading: regionsLoading } = useQuery('regions', regionService.getAll);
  const { data: states, isLoading: statesLoading } = useQuery('states', stateService.getAll, {
    onSuccess: (data) => {
      console.log('States loaded successfully:', data);
    },
    onError: (error) => {
      console.error('Error loading states:', error);
      toast.error('Failed to load states');
    }
  });

  const createMutation = useMutation(regionService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('regions');
      toast.success('Region created successfully');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Create region error:', error);
      toast.error(error.response?.data?.message || 'Failed to create region');
    }
  });

  const updateMutation = useMutation(
    (data: { id: string; data: any }) => regionService.update(data.id, data.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('regions');
        toast.success('Region updated successfully');
        handleClose();
      },
      onError: (error: any) => {
        console.error('Update region error:', error);
        toast.error(error.response?.data?.message || 'Failed to update region');
      }
    }
  );

  const deleteMutation = useMutation(regionService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('regions');
      toast.success('Region deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete region error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete region');
    }
  });

  const handleOpen = (region?: any) => {
    if (region) {
      console.log('Opening edit with region:', region);
      setEditingRegion(region);
      setFormData({ 
        name: region.region_name, 
        stateId: region.state_id?.toString() || '' 
      });
    } else {
      setEditingRegion(null);
      setFormData({ name: '', stateId: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRegion(null);
    setFormData({ name: '', stateId: '' });
  };

  const handleStateChange = (event: any) => {
    const value = event.target.value;
    console.log('State selected:', value);
    setFormData(prev => ({ ...prev, stateId: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);

    const submitData = {
      region_name: formData.name,
      state_id: formData.stateId
    };

    console.log('Submitting to API:', submitData);

    if (editingRegion) {
      updateMutation.mutate({
        id: editingRegion.id,
        data: submitData
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (id: string) => {
    console.log('Deleting region:', id);
    deleteMutation.mutate(id);
  };

  if (regionsLoading || statesLoading) return <div>Loading...</div>;

  console.log('Current states data:', states);
  console.log('Current form data:', formData);

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        variant="contained" 
        onClick={() => handleOpen()} 
        sx={{ 
          mb: 3,
          backgroundColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.dark',
          }
        }}
      >
        Add New Region
      </Button>

      <TableContainer 
        component={Paper} 
        sx={{ 
          backgroundColor: 'background.paper',
          boxShadow: 3,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Region Name</TableCell>
              <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>State</TableCell>
              <TableCell sx={{ color: 'common.white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {regions?.map((region: any) => {
              const state = states?.find(state => state.id === region.state_id);
              return (
                <TableRow 
                  key={region.id}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    '&:hover': { backgroundColor: 'action.selected' },
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <TableCell>{region.region_name}</TableCell>
                  <TableCell>{state?.state_name}</TableCell>
                  <TableCell>
                    <Button 
                      onClick={() => handleOpen(region)}
                      sx={{ mr: 1 }}
                      variant="outlined"
                      size="small"
                    >
                      Edit
                    </Button>
                    <Button 
                      color="error"
                      variant="outlined"
                      size="small"
                      onClick={() => handleDelete(region.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {editingRegion ? 'Edit Region' : 'Add New Region'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              margin="normal"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="state-select-label">State</InputLabel>
              <Select
                labelId="state-select-label"
                value={formData.stateId}
                onChange={handleStateChange}
                required
                label="State"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300
                    }
                  }
                }}
              >
                {states?.map((state: any) => (
                  <MenuItem key={state.id} value={state.id.toString()}>
                    {state.state_name}
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
    </Box>
  );
}
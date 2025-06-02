import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-toastify';
import { mpService, type MPType } from '../api/services/mp.service';
import { stateService } from '../api/services/state.service';

interface FormData {
  mp_name: string;
  mp_mobile: string;
  mp_type: MPType;
  state_id: string;
}

export default function MPs() {
  const [open, setOpen] = useState(false);
  const [editingMP, setEditingMP] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    mp_name: '',
    mp_mobile: '',
    mp_type: 'state',
    state_id: ''
  });
  const queryClient = useQueryClient();

  const { data: mps = [], isLoading: mpsLoading } = useQuery('mps', mpService.getAll, {
    onError: (error: any) => {
      console.error('Error loading MPs:', error);
      toast.error('Failed to load MPs');
    }
  });

  const { data: states = [], isLoading: statesLoading } = useQuery('states', stateService.getAll, {
    onError: (error: any) => {
      console.error('Error loading states:', error);
      toast.error('Failed to load states');
    }
  });

  const createMutation = useMutation(mpService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('mps');
      toast.success('MP created successfully');
      handleClose();
    },
    onError: (error: any) => {
      console.error('Create MP error:', error);
      toast.error(error.response?.data?.message || 'Failed to create MP');
    }
  });

  const updateMutation = useMutation(
    (data: { id: number; data: any }) => mpService.update(data.id, data.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('mps');
        toast.success('MP updated successfully');
        handleClose();
      },
      onError: (error: any) => {
        console.error('Update MP error:', error);
        toast.error(error.response?.data?.message || 'Failed to update MP');
      }
    }
  );

  const deleteMutation = useMutation(mpService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('mps');
      toast.success('MP deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete MP error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete MP');
    }
  });

  const handleOpen = (mp?: any) => {
    if (mp) {
      setEditingMP(mp);
      setFormData({ 
        mp_name: mp.mp_name,
        mp_mobile: mp.mobile || '',
        mp_type: mp.mp_type || 'state',
        state_id: mp.state_id.toString()
      });
    } else {
      setEditingMP(null);
      setFormData({ mp_name: '', mp_mobile: '', mp_type: 'state', state_id: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMP(null);
    setFormData({ mp_name: '', mp_mobile: '', mp_type: 'state', state_id: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mp_name || !formData.mp_type || !formData.state_id) {
      toast.error('Please fill all required fields');
      return;
    }

    const submitData = {
      mp_name: formData.mp_name,
      mobile: formData.mp_mobile || undefined,
      mp_type: formData.mp_type,
      state_id: parseInt(formData.state_id, 10),
      applicant_id: 'default-applicant-id'
    };

    if (editingMP) {
      updateMutation.mutate({ id: editingMP.mp_id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  if (mpsLoading || statesLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
      <Typography>Loading...</Typography>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">MPs Management</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleOpen()}
        >
          Add New MP
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Mobile</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mps.map((mp: any) => (
              <TableRow key={mp.mp_id}>
                <TableCell>{mp.mp_name}</TableCell>
                <TableCell>{mp.mp_type === 'federal' ? 'Federal' : 'State'}</TableCell>
                <TableCell>
                  {states.find((state: any) => state.state_id === mp.state_id)?.state_name || 'Unknown'}
                </TableCell>
                <TableCell>{mp.mobile || 'N/A'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(mp)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => {
                      if(window.confirm('Are you sure you want to delete this MP?')) {
                        deleteMutation.mutate(mp.mp_id);
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {mps.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No MPs found. Please add a new one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMP ? 'Edit MP' : 'Add New MP'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="state-label">State</InputLabel>
              <Select
                labelId="state-label"
                value={formData.state_id}
                onChange={(e) => setFormData({ ...formData, state_id: e.target.value as string })}
                label="State"
                required
              >
                {states.map((state: any) => (
                  <MenuItem key={state.state_id} value={state.state_id.toString()}>
                    {state.state_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="dense"
              label="MP Name"
              value={formData.mp_name}
              onChange={(e) => setFormData({ ...formData, mp_name: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="mp-type-label">MP Type</InputLabel>
              <Select
                labelId="mp-type-label"
                value={formData.mp_type}
                onChange={(e) => setFormData({ ...formData, mp_type: e.target.value as MPType })}
                label="MP Type"
                required
              >
                <MenuItem value="federal">Federal</MenuItem>
                <MenuItem value="state">State</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              margin="dense"
              label="Mobile Number"
              value={formData.mp_mobile}
              onChange={(e) => setFormData({ ...formData, mp_mobile: e.target.value })}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!formData.mp_name || !formData.state_id || !formData.mp_type}
          >
            {editingMP ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
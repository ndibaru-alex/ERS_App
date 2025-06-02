import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Box
} from '@mui/material';
import { toast } from 'react-toastify';
import { stateService } from '../api/services/state.service';

export default function States() {
  const [open, setOpen] = useState(false);
  const [editingState, setEditingState] = useState<any>(null);
  const [formData, setFormData] = useState({
    state_name: '',
  });

  const queryClient = useQueryClient();
  const { data: states, isLoading } = useQuery('states', stateService.getAll);

  const createMutation = useMutation(stateService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('states');
      toast.success('State created successfully');
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create state');
    }
  });

  const updateMutation = useMutation(
    (data: { id: string; data: any }) => stateService.update(data.id, data.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('states');
        toast.success('State updated successfully');
        handleClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update state');
      }
    }
  );

  const deleteMutation = useMutation(stateService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('states');
      toast.success('State deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete state');
    }
  });

  const handleOpen = (state?: any) => {
    if (state) {
      setEditingState(state);
      setFormData({ state_name: state.state_name });
    } else {
      setEditingState(null);
      setFormData({ state_name: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingState(null);
    setFormData({ state_name: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingState) {
      updateMutation.mutate({ id: editingState.id, data: { name: formData.state_name } });
    } else {
      createMutation.mutate({ name: formData.state_name });
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <Box sx={{ 
      p: 3, 
      backgroundColor: 'background.default',
      minHeight: 'calc(100vh - 114px)' 
    }}>
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
        Add New State
      </Button>

      <TableContainer 
        component={Paper}
        sx={{ 
          backgroundColor: 'background.paper',
          boxShadow: 1,
          borderRadius: 1,
          overflow: 'hidden',
          backdropFilter: 'blur(10px)',
          mt: 2
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ 
                backgroundColor: 'primary.main', 
                color: 'primary.contrastText', 
                fontWeight: 'bold' 
              }}>State Name</TableCell>
              <TableCell sx={{ 
                backgroundColor: 'primary.main', 
                color: 'primary.contrastText', 
                fontWeight: 'bold' 
              }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {states?.map((state: any) => (
              <TableRow 
                key={state.id}
                sx={{ 
                  '&:nth-of-type(odd)': { backgroundColor: 'grey.50' },
                  '&:hover': { backgroundColor: 'action.hover' },
                  transition: 'background-color 0.2s ease'
                }}
              >
                <TableCell>{state.state_name}</TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleOpen(state)}
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
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this state?')) {
                        deleteMutation.mutate(state.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingState ? 'Edit State' : 'Add New State'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="State Name"
              margin="normal"
              value={formData.state_name}
              onChange={(e) => setFormData({ state_name: e.target.value })}
              required
            />
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
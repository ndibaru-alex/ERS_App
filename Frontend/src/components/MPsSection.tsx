import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  CardActions, IconButton, CircularProgress, TextField,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useMutation, useQuery } from 'react-query';
import { mpService } from '../api/services/mp.service';
import { stateService } from '../api/services/state.service';
import { toast } from 'react-toastify';

interface MP {
  mp_id: number;
  mp_name: string;
  mobile: string;
  mp_type: 'federal' | 'state';
  state_id: number;
  state_name?: string;
}

interface Props {
  mps: MP[];
  applicantId: number;
  isVerified: boolean;
  onUpdate: () => void;
}

export default function MPsSection({ mps, applicantId, isVerified, onUpdate }: Props) {
  const [editingMP, setEditingMP] = useState<MP | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newMP, setNewMP] = useState<Partial<MP>>({});

  // Get states for dropdown
  const { data: states = [] } = useQuery('states', stateService.getAll);

  const addMutation = useMutation(
    (data: Partial<MP>) => mpService.create({ ...data, applicant_id: applicantId }),
    {
      onSuccess: () => {
        toast.success('MP reference added successfully');
        setNewMP({});
        setIsAdding(false);
        onUpdate();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add MP reference');
      }
    }
  );

  const updateMutation = useMutation(
    (data: MP) => mpService.update(data.mp_id, data),
    {
      onSuccess: () => {
        toast.success('MP reference updated successfully');
        setEditingMP(null);
        onUpdate();
      }
    }
  );

  const deleteMutation = useMutation(
    (id: number) => mpService.delete(id),
    {
      onSuccess: () => {
        toast.success('MP reference deleted successfully');
        onUpdate();
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMP) {
      updateMutation.mutate(editingMP);
    } else if (isAdding) {
      addMutation.mutate(newMP);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this MP reference?')) {
      deleteMutation.mutate(id);
    }
  };

  const validateMobile = (mobile: string) => {
    return /^\d{10}$/.test(mobile);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">MP References</Typography>
        {!isVerified && !isAdding && !editingMP && (
          <Button variant="contained" onClick={() => setIsAdding(true)}>
            Add MP Reference
          </Button>
        )}
      </Box>

      {(isAdding || editingMP) && (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="MP Name"
                value={editingMP?.mp_name || newMP.mp_name || ''}
                onChange={(e) => editingMP 
                  ? setEditingMP({ ...editingMP, mp_name: e.target.value })
                  : setNewMP({ ...newMP, mp_name: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Mobile Number"
                value={editingMP?.mobile || newMP.mobile || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                  editingMP 
                    ? setEditingMP({ ...editingMP, mobile: value })
                    : setNewMP({ ...newMP, mobile: value });
                }}
                error={!!(editingMP?.mobile || newMP.mobile) && !validateMobile(editingMP?.mobile || newMP.mobile || '')}
                helperText={!!(editingMP?.mobile || newMP.mobile) && !validateMobile(editingMP?.mobile || newMP.mobile || '') 
                  ? "Please enter a valid 10-digit mobile number" 
                  : ""}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>MP Type</InputLabel>
                <Select
                  value={editingMP?.mp_type || newMP.mp_type || ''}
                  onChange={(e) => editingMP 
                    ? setEditingMP({ ...editingMP, mp_type: e.target.value as 'federal' | 'state' })
                    : setNewMP({ ...newMP, mp_type: e.target.value as 'federal' | 'state' })
                  }
                  label="MP Type"
                >
                  <MenuItem value="federal">Federal</MenuItem>
                  <MenuItem value="state">State</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>State</InputLabel>
                <Select
                  value={editingMP?.state_id || newMP.state_id || ''}
                  onChange={(e) => editingMP 
                    ? setEditingMP({ ...editingMP, state_id: e.target.value as number })
                    : setNewMP({ ...newMP, state_id: e.target.value as number })
                  }
                  label="State"
                >
                  {states.map((state: any) => (
                    <MenuItem key={state.state_id} value={state.state_id}>
                      {state.state_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={addMutation.isLoading || updateMutation.isLoading}
            >
              {addMutation.isLoading || updateMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : editingMP ? 'Update' : 'Add'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setEditingMP(null);
                setIsAdding(false);
              }}
            >
              Cancel
            </Button>
          </Box>
        </form>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 2,
        }}>
        {mps.map((mp) => (
          <Box key={mp.mp_id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>{mp.mp_name}</Typography>
            <Typography><strong>Type:</strong> {mp.mp_type.toUpperCase()}</Typography>
            <Typography><strong>Mobile:</strong> {mp.mobile}</Typography>
            <Typography><strong>State:</strong> {mp.state_name}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
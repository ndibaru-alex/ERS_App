import React, { useState } from 'react';
import {
  Box, Typography, Button,
  CardActions, IconButton, CircularProgress, TextField,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
// Removed unused 'Card' import
import { Delete, Edit } from '@mui/icons-material';
import { useMutation, useQuery } from 'react-query';
import { employmentService } from '../api/services/employment.service';
import { cityService } from '../api/services/city.service';
import { toast } from 'react-toastify';

interface Employment {
  employment_id: number;
  employer_name: string;
  city_id: number;
  job_title: string;
  start_date: string;
  end_date: string;
  contact_name: string;
  emp_verified: boolean; // Changed to boolean
  city_name?: string;
  region_name?: string;
  state_name?: string;
}

interface Props {
  employments: Employment[];
  applicantId: number;
  isVerified: boolean;
  onUpdate: () => void;
}

export default function WorkExperienceSection({ employments, applicantId, isVerified, onUpdate }: Props) {
  const [editingJob, setEditingJob] = useState<Employment | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newJob, setNewJob] = useState<Partial<Employment>>({});

  // Get cities for dropdown
  const { data: cities = [] } = useQuery('cities', cityService.getAll);

  const addMutation = useMutation(
    (data: Partial<Employment>) => employmentService.create(applicantId.toString(), data),
    {
      onSuccess: () => {
        toast.success('Employment record added successfully');
        setNewJob({});
        setIsAdding(false);
        onUpdate();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add employment record');
      }
    }
  );

  const updateMutation = useMutation(
    (data: Employment) => employmentService.update(data.employment_id.toString(), data),
    {
      onSuccess: () => {
        toast.success('Employment record updated successfully');
        setEditingJob(null);
        onUpdate();
      }
    }
  );

  const deleteMutation = useMutation(
    (id: number) => employmentService.delete(id.toString()),
    {
      onSuccess: () => {
        toast.success('Employment record deleted successfully');
        onUpdate();
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      updateMutation.mutate(editingJob);
    } else if (isAdding) {
      addMutation.mutate(newJob);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this employment record?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Work Experience</Typography>
        {!isVerified && !isAdding && !editingJob && (
          <Button variant="contained" onClick={() => setIsAdding(true)}>
            Add Employment
          </Button>
        )}
      </Box>

      {(isAdding || editingJob) && (
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
              },
              gap: 2,
              mb: 3,
            }}
          >
            <TextField
              fullWidth
              required
              label="Employer Name"
              value={editingJob?.employer_name || newJob.employer_name || ''}
              onChange={(e) => editingJob 
                ? setEditingJob({ ...editingJob, employer_name: e.target.value })
                : setNewJob({ ...newJob, employer_name: e.target.value })
              }
            />
            <FormControl fullWidth required>
              <InputLabel>City</InputLabel>
              <Select
                value={editingJob?.city_id || newJob.city_id || ''}
                onChange={(e) => editingJob 
                  ? setEditingJob({ ...editingJob, city_id: e.target.value as number })
                  : setNewJob({ ...newJob, city_id: e.target.value as number })
                }
                label="City"
              >
                {cities.map((city: any) => (
                  <MenuItem key={city.city_id} value={city.city_id}>
                    {city.city_name}, {city.region_name}, {city.state_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              required
              label="Job Title"
              value={editingJob?.job_title || newJob.job_title || ''}
              onChange={(e) => editingJob 
                ? setEditingJob({ ...editingJob, job_title: e.target.value })
                : setNewJob({ ...newJob, job_title: e.target.value })
              }
            />
            <TextField
              fullWidth
              required
              label="Contact Person"
              value={editingJob?.contact_name || newJob.contact_name || ''}
              onChange={(e) => editingJob 
                ? setEditingJob({ ...editingJob, contact_name: e.target.value })
                : setNewJob({ ...newJob, contact_name: e.target.value })
              }
            />
            <TextField
              fullWidth
              required
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={editingJob?.start_date || newJob.start_date || ''}
              onChange={(e) => editingJob 
                ? setEditingJob({ ...editingJob, start_date: e.target.value })
                : setNewJob({ ...newJob, start_date: e.target.value })
              }
            />
            <TextField
              fullWidth
              required
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={editingJob?.end_date || newJob.end_date || ''}
              onChange={(e) => editingJob 
                ? setEditingJob({ ...editingJob, end_date: e.target.value })
                : setNewJob({ ...newJob, end_date: e.target.value })
              }
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={addMutation.isLoading || updateMutation.isLoading}
            >
              {addMutation.isLoading || updateMutation.isLoading ? (
                <CircularProgress size={24} />
              ) : editingJob ? 'Update' : 'Add'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setEditingJob(null);
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
        }}
      >
        {employments.map((job) => (
          <Box key={job.employment_id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>{job.employer_name}</Typography>
            <Typography variant="subtitle1" color="primary">{job.job_title}</Typography>
            <Typography>Location: {job.city_name}, {job.region_name}, {job.state_name}</Typography>
            <Typography>
              Period: {new Date(job.start_date).toLocaleDateString()} - {new Date(job.end_date).toLocaleDateString()}
            </Typography>
            <Typography>Contact Person: {job.contact_name}</Typography>
            {!isVerified && (
              <CardActions>
                <IconButton onClick={() => setEditingJob(job)} size="small">
                  <Edit />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(job.employment_id)}
                  disabled={deleteMutation.isLoading}
                  size="small"
                  color="error"
                >
                  <Delete />
                </IconButton>
              </CardActions>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
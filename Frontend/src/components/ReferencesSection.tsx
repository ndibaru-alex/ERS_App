import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  CardActions, IconButton, CircularProgress, TextField
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useMutation } from 'react-query';
import { referenceService } from '../api/services/reference.service';
import { toast } from 'react-toastify';

interface Reference {
  reference_id: number;
  ref_name: string;
  relationship: string;
  contact_number: string;
  years_known: number;
  ref_address: string;
}

interface Props {
  references: Reference[];
  applicantId: number;
  isVerified: boolean;
  onUpdate: () => void;
}

export default function ReferencesSection({ references, applicantId, isVerified, onUpdate }: Props) {
  const [editingRef, setEditingRef] = useState<Reference | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newRef, setNewRef] = useState<Partial<Reference>>({});

  const addMutation = useMutation(
    (data: Partial<Reference>) => referenceService.create({ ...data, applicant_id: applicantId }),
    {
      onSuccess: () => {
        toast.success('Reference added successfully');
        setNewRef({});
        setIsAdding(false);
        onUpdate();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add reference');
      }
    }
  );

  const updateMutation = useMutation(
    (data: Reference) => referenceService.update(data.reference_id, data),
    {
      onSuccess: () => {
        toast.success('Reference updated successfully');
        setEditingRef(null);
        onUpdate();
      }
    }
  );

  const deleteMutation = useMutation(
    (id: number) => referenceService.delete(id),
    {
      onSuccess: () => {
        toast.success('Reference deleted successfully');
        onUpdate();
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRef) {
      updateMutation.mutate(editingRef);
    } else if (isAdding) {
      addMutation.mutate(newRef);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this reference?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">References</Typography>
        {!isVerified && !isAdding && !editingRef && (
          <Button variant="contained" onClick={() => setIsAdding(true)}>
            Add Reference
          </Button>
        )}
      </Box>

      {(isAdding || editingRef) && (
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
              label="Reference Name"
              value={editingRef?.ref_name || newRef.ref_name || ''}
              onChange={(e) =>
                editingRef
                  ? setEditingRef({ ...editingRef, ref_name: e.target.value })
                  : setNewRef({ ...newRef, ref_name: e.target.value })
              }
            />
            <TextField
              fullWidth
              required
              label="Relationship"
              value={editingRef?.relationship || newRef.relationship || ''}
              onChange={(e) =>
                editingRef
                  ? setEditingRef({ ...editingRef, relationship: e.target.value })
                  : setNewRef({ ...newRef, relationship: e.target.value })
              }
            />
            <TextField
              fullWidth
              required
              label="Contact Number"
              value={editingRef?.contact_number || newRef.contact_number || ''}
              onChange={(e) =>
                editingRef
                  ? setEditingRef({ ...editingRef, contact_number: e.target.value })
                  : setNewRef({ ...newRef, contact_number: e.target.value })
              }
            />
            <TextField
              fullWidth
              required
              type="number"
              label="Years Known"
              inputProps={{ min: 0 }}
              value={editingRef?.years_known || newRef.years_known || ''}
              onChange={(e) =>
                editingRef
                  ? setEditingRef({ ...editingRef, years_known: parseInt(e.target.value) })
                  : setNewRef({ ...newRef, years_known: parseInt(e.target.value) })
              }
            />
            <TextField
              fullWidth
              required
              label="Address"
              multiline
              rows={2}
              value={editingRef?.ref_address || newRef.ref_address || ''}
              onChange={(e) =>
                editingRef
                  ? setEditingRef({ ...editingRef, ref_address: e.target.value })
                  : setNewRef({ ...newRef, ref_address: e.target.value })
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
              ) : editingRef ? 'Update' : 'Add'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setEditingRef(null);
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
        {references.map((ref) => (
          <Box
            key={ref.reference_id}
            sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
          >
            <Typography variant="h6" gutterBottom>
              {ref.ref_name}
            </Typography>
            <Typography>
              <strong>Relationship:</strong> {ref.relationship}
            </Typography>
            <Typography>
              <strong>Contact:</strong> {ref.contact_number}
            </Typography>
            <Typography>
              <strong>Years Known:</strong> {ref.years_known}
            </Typography>
            <Typography>
              <strong>Address:</strong> {ref.ref_address}
            </Typography>
            {!isVerified && (
              <CardActions>
                <IconButton onClick={() => setEditingRef(ref)} size="small">
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(ref.reference_id)}
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
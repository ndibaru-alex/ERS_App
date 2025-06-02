import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent,
  CardActions, IconButton, CircularProgress, TextField
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useMutation } from 'react-query';
import { documentService } from '../api/services/document.service';
import { toast } from 'react-toastify';

interface Document {
  document_id: number;
  document_type: string;
  document_number: string;
  issue_date: string;
  expiry_date: string;
  issuing_authority: string;
}

interface Props {
  documents: Document[];
  applicantId: number;
  isVerified: boolean;
  onUpdate: () => void;
}

export default function DocumentsSection({ documents, applicantId, isVerified, onUpdate }: Props) {
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newDoc, setNewDoc] = useState<Partial<Document>>({});

  const addMutation = useMutation(
    (data: Partial<Document>) => documentService.create({ ...data, applicant_id: applicantId }),
    {
      onSuccess: () => {
        toast.success('Document added successfully');
        setNewDoc({});
        setIsAdding(false);
        onUpdate();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add document');
      }
    }
  );

  const updateMutation = useMutation(
    (data: Document) => documentService.update(data.document_id, data),
    {
      onSuccess: () => {
        toast.success('Document updated successfully');
        setEditingDoc(null);
        onUpdate();
      }
    }
  );

  const deleteMutation = useMutation(
    (id: number) => documentService.delete(id),
    {
      onSuccess: () => {
        toast.success('Document deleted successfully');
        onUpdate();
      }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDoc) {
      updateMutation.mutate(editingDoc);
    } else if (isAdding) {
      addMutation.mutate(newDoc);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Documents</Typography>
        {!isVerified && !isAdding && !editingDoc && (
          <Button variant="contained" onClick={() => setIsAdding(true)}>
            Add Document
          </Button>
        )}
      </Box>

      {(isAdding || editingDoc) && (
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Document Type"
                value={editingDoc?.document_type || newDoc.document_type || ''}
                onChange={(e) => editingDoc 
                  ? setEditingDoc({ ...editingDoc, document_type: e.target.value })
                  : setNewDoc({ ...newDoc, document_type: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Document Number"
                value={editingDoc?.document_number || newDoc.document_number || ''}
                onChange={(e) => editingDoc 
                  ? setEditingDoc({ ...editingDoc, document_number: e.target.value })
                  : setNewDoc({ ...newDoc, document_number: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="Issue Date"
                InputLabelProps={{ shrink: true }}
                value={editingDoc?.issue_date || newDoc.issue_date || ''}
                onChange={(e) => editingDoc 
                  ? setEditingDoc({ ...editingDoc, issue_date: e.target.value })
                  : setNewDoc({ ...newDoc, issue_date: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                type="date"
                label="Expiry Date"
                InputLabelProps={{ shrink: true }}
                value={editingDoc?.expiry_date || newDoc.expiry_date || ''}
                onChange={(e) => editingDoc 
                  ? setEditingDoc({ ...editingDoc, expiry_date: e.target.value })
                  : setNewDoc({ ...newDoc, expiry_date: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Issuing Authority"
                value={editingDoc?.issuing_authority || newDoc.issuing_authority || ''}
                onChange={(e) => editingDoc 
                  ? setEditingDoc({ ...editingDoc, issuing_authority: e.target.value })
                  : setNewDoc({ ...newDoc, issuing_authority: e.target.value })
                }
              />
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
              ) : editingDoc ? 'Update' : 'Add'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setEditingDoc(null);
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
        {documents.map((doc) => (
          <Box key={doc.document_id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>{doc.document_type}</Typography>
            <Typography>Document Number: {doc.document_number}</Typography>
            <Typography>Issue Date: {new Date(doc.issue_date).toLocaleDateString()}</Typography>
            <Typography>Expiry Date: {new Date(doc.expiry_date).toLocaleDateString()}</Typography>
            <Typography>Issuing Authority: {doc.issuing_authority}</Typography>
            {!isVerified && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <IconButton onClick={() => setEditingDoc(doc)} size="small">
                  <Edit />
                </IconButton>
                <IconButton 
                  onClick={() => handleDelete(doc.document_id)}
                  disabled={deleteMutation.isLoading}
                  size="small"
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
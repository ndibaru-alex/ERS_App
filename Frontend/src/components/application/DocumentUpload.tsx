import { useState, useRef } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation } from 'react-query';
import { toast } from 'react-toastify';
import { documentService } from '../../api/services/document.service';

const DOCUMENT_TYPES = [
  'resume',
  'cover_letter',
  'id_proof',
  'educational_certificates',
  'experience_letters',
  'skill_certificates',
  'recommendation_letters'
];

interface DocumentUploadProps {
  applicantId: string;
}

export default function DocumentUpload({ applicantId }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentForm, setDocumentForm] = useState({
    document_type: '',
    file_url: ''
  });

  const { data: documents = [], refetch: refetchDocuments } = useQuery(
    ['applicant-documents', applicantId],
    () => documentService.getApplicantDocuments(applicantId),
    {
      enabled: !!applicantId
    }
  );

  const handleUpload = async (data: { file: File; document_type: string }) => {
    if (!data.file || !data.document_type) {
      toast.error('File and document type are required');
      return;
    }

    try {
      const response = await documentService.uploadDocument(applicantId, data.file, {
        document_type: data.document_type,
        file_url: '', // Placeholder, will be set by the backend
        applicant_id: applicantId, // Added missing property
        status: 'pending', // Added missing property
        doc_verified: '0', // Added missing property
        uploaded_at: '', // Placeholder, will be set by the backend
        updated_at: '' // Placeholder, will be set by the backend
      });

      toast.success('Document uploaded successfully');
      return response;
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    }
  };

  const uploadMutation = useMutation(
    async (data: any) => {
      const fileInput = fileInputRef.current;
      if (!fileInput?.files?.[0]) {
        throw new Error('No file selected');
      }

      return handleUpload({
        file: fileInput.files[0],
        document_type: data.document_type
      });
    },
    {
      onSuccess: () => {
        refetchDocuments();
        setDocumentForm({
          document_type: '',
          file_url: ''
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to upload document');
      }
    }
  );

  const deleteMutation = useMutation(
    (documentId: string) => documentService.delete(documentId),
    {
      onSuccess: () => {
        toast.success('Document deleted successfully');
        refetchDocuments();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete document');
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentForm.document_type) {
      toast.error('Please select a document type');
      return;
    }

    const fileInput = fileInputRef.current;
    if (!fileInput?.files?.[0]) {
      toast.error('Please select a file to upload');
      return;
    }

    uploadMutation.mutate({
      ...documentForm,
      file: fileInput.files[0]
    });
  };

  return (
    <Box>
      {/* Show uploaded documents first */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Uploaded Documents
        </Typography>
        <List>
          {documents.map((doc: any) => (
            <ListItem
              key={doc.document_id}
              secondaryAction={
                <IconButton 
                  edge="end" 
                  aria-label="delete"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this document?')) {
                      deleteMutation.mutate(doc.document_id);
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={doc.document_type.replace(/_/g, ' ').toUpperCase()}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Status: {doc.status}
                    </Typography>
                    {doc.remarks && (
                      <Typography component="p" variant="body2">
                        Remarks: {doc.remarks}
                      </Typography>
                    )}
                    <Typography component="p" variant="body2">
                      Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      href={doc.file_url}
                      target="_blank"
                      sx={{ mt: 1 }}
                    >
                      View Document
                    </Button>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Upload form below */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload Required Documents
        </Typography>
        <form onSubmit={handleSubmit}>
          <FormControl 
            fullWidth 
            margin="normal"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                  transition: 'border-color 0.2s ease-in-out',
                },
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                  borderWidth: '2px',
                },
              },
              '& .MuiSelect-select': {
                padding: '14px',
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'primary.main',
              },
              mb: 3
            }}
          >
            <InputLabel>Document Type</InputLabel>
            <Select
              value={documentForm.document_type}
              onChange={(e) => setDocumentForm({
                ...documentForm,
                document_type: e.target.value
              })}
              label="Document Type"
              required
              MenuProps={{
                PaperProps: {
                  sx: {
                    maxHeight: 300,
                    '& .MuiMenuItem-root': {
                      padding: '12px 16px',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                    },
                  },
                },
              }}
            >
              {DOCUMENT_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.replace(/_/g, ' ').toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Selected File Path"
            value={fileInputRef.current?.value || ''}
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
          
          <Button
            type="submit"
            variant="contained"
            disabled={uploadMutation.isLoading}
            sx={{ mt: 2 }}
          >
            {uploadMutation.isLoading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
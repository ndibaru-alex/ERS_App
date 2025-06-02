import { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { languageService, type LanguageLevel as ApiLanguageLevel } from '../../api/services/language.service';

// Updated the `LanguageLevel` type to include "Non" to match `ApiLanguageLevel`
type LanguageLevel = 'Non' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
const LANGUAGE_LEVELS: LanguageLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'Native'];
const LANGUAGES = ['English', 'Arabic'];

interface Language {
  app_lan_id?: number;
  language: string;
  level: LanguageLevel;
}

interface LanguageFormProps {
  applicantId: string;
}

export default function LanguageForm({ applicantId }: LanguageFormProps) {
  const queryClient = useQueryClient();
  const [currentLanguage, setCurrentLanguage] = useState<{
    language: string;
    level: LanguageLevel;
  }>({
    language: '',
    level: '' as LanguageLevel
  });
  
  // Fetch languages for this applicant
  const { 
    data: languages = [], 
    isLoading: isLoadingLanguages, 
    error: languagesError 
  } = useQuery(
    ['languages', applicantId],
    () => languageService.getByApplicant(applicantId),
    {
      onError: (error: any) => {
        console.error('Error fetching languages:', error);
        toast.error('Failed to load language data');
      }
    }
  );

  // Mutations for CRUD operations
  const createMutation = useMutation(
    (data: Omit<Language, 'app_lan_id'> & { applicant_id: string }) => languageService.create({
      ...data,
      applicant_id: applicantId
    }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['languages', applicantId]);
        toast.success('Language added successfully');
        setCurrentLanguage({ language: '', level: '' as LanguageLevel });
      },
      onError: (error: any) => {
        console.error('Error adding language:', error);
        toast.error(error.response?.data?.message || 'Failed to add language');
      }
    }
  );

  const deleteMutation = useMutation(
    (id: number) => languageService.delete(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['languages', applicantId]);
        toast.success('Language removed successfully');
      },
      onError: (error: any) => {
        console.error('Error deleting language:', error);
        toast.error(error.response?.data?.message || 'Failed to remove language');
      }
    }
  );

  const handleAddLanguage = () => {
    if (!currentLanguage.language || !currentLanguage.level) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if language already exists
    const existingLanguage = languages.find(
      (lang: any) => lang.language === currentLanguage.language
    );

    if (existingLanguage) {
      toast.error('You have already added this language');
      return;
    }

    // Create language through API
    createMutation.mutate({
      language: currentLanguage.language,
      level: currentLanguage.level as ApiLanguageLevel,
      applicant_id: applicantId
    });
  };

  const handleDeleteLanguage = (id: number) => {
    if (window.confirm('Are you sure you want to delete this language?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoadingLanguages) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (languagesError) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Error loading languages. Please try again later.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Language Proficiency
        </Typography>
        
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)'
          },
          gap: 2
        }}>
          <FormControl fullWidth required>
            <InputLabel>Language</InputLabel>
            <Select
              value={currentLanguage.language}
              onChange={(e) => setCurrentLanguage({ ...currentLanguage, language: e.target.value })}
              label="Language"
            >
              {LANGUAGES.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  {lang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth required>
            <InputLabel>Proficiency Level</InputLabel>
            <Select
              value={currentLanguage.level}
              onChange={(e) => setCurrentLanguage({ ...currentLanguage, level: e.target.value as LanguageLevel })}
              label="Proficiency Level"
            >
              {LANGUAGE_LEVELS.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Button
              variant="contained"
              onClick={handleAddLanguage}
              disabled={!currentLanguage.language || !currentLanguage.level || createMutation.isLoading}
            >
              {createMutation.isLoading ? 'Adding...' : 'Add Language'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {languages && languages.length > 0 ? (
            languages.map((lang: any) => (
              <Chip
                key={lang.app_lan_id}
                label={`${lang.language} (${lang.level})`}
                onDelete={() => handleDeleteLanguage(lang.app_lan_id)}
                color="primary"
                variant="outlined"
                disabled={deleteMutation.isLoading}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No languages added yet. Add your language proficiency.
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
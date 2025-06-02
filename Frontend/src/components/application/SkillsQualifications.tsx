import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

interface SkillsQualificationsProps {
  applicantId: string; // Kept for future use when implementing save functionality
}

export default function SkillsQualifications(_props: SkillsQualificationsProps) {
  const [skill, setSkill] = useState('');
  const [skillLevel, setSkillLevel] = useState('');
  const [skills, setSkills] = useState<Array<{ name: string; level: string }>>([]);
  const [qualification, setQualification] = useState('');
  const [qualifications, setQualifications] = useState<string[]>([]);

  const handleAddSkill = () => {
    if (skill && skillLevel) {
      setSkills([...skills, { name: skill, level: skillLevel }]);
      setSkill('');
      setSkillLevel('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s.name !== skillToRemove));
  };

  const handleAddQualification = () => {
    if (qualification) {
      setQualifications([...qualifications, qualification]);
      setQualification('');
    }
  };

  const handleRemoveQualification = (qualToRemove: string) => {
    setQualifications(qualifications.filter(q => q !== qualToRemove));
  };

  return (
    <Box>
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr'
        },
        gap: 3
      }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Skills
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)'
            },
            gap: 2
          }}>
            <TextField
              fullWidth
              label="Skill"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Proficiency Level</InputLabel>
              <Select
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
                label="Proficiency Level"
              >
                {SKILL_LEVELS.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Button
                variant="contained"
                onClick={handleAddSkill}
                disabled={!skill || !skillLevel}
              >
                Add Skill
              </Button>
            </Box>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {skills.map((s) => (
              <Chip
                key={s.name}
                label={`${s.name} (${s.level})`}
                onDelete={() => handleRemoveSkill(s.name)}
              />
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Additional Qualifications
          </Typography>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr'
            },
            gap: 2
          }}>
            <TextField
              fullWidth
              label="Qualification"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              placeholder="Enter certifications, awards, or other qualifications"
            />
            <Box>
              <Button
                variant="contained"
                onClick={handleAddQualification}
                disabled={!qualification}
              >
                Add Qualification
              </Button>
            </Box>
          </Box>
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {qualifications.map((q) => (
              <Chip
                key={q}
                label={q}
                onDelete={() => handleRemoveQualification(q)}
              />
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
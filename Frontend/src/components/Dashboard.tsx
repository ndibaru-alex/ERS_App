import { useQuery } from 'react-query';
import { Paper, Typography, Box } from '@mui/material';
import {
  PeopleOutline,
  WorkOutline,
  PersonAddOutlined,
  AssignmentTurnedInOutlined,
} from '@mui/icons-material';
import { stateService } from '../api/services/state.service';
import { regionService } from '../api/services/region.service';
import { cityService } from '../api/services/city.service';
import { mpService } from '../api/services/mp.service';

export default function Dashboard() {
  const { data: states } = useQuery('states', stateService.getAll);
  const { data: regions } = useQuery('regions', regionService.getAll);
  const { data: cities } = useQuery('cities', cityService.getAll);
  const { data: mps } = useQuery('mps', mpService.getAll);

  const totalApplicants = states?.length || 0;
  const activeApplicants = regions?.length || 0;
  const pendingApplicants = cities?.length || 0;
  const verifiedApplicants = mps?.length || 0;

  return (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(4, 1fr)'
      },
      gap: 3,
      p: 3
    }}>
      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'primary.light',
          color: 'primary.contrastText',
        }}
      >
        <PeopleOutline sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h4" gutterBottom>
          {totalApplicants}
        </Typography>
        <Typography variant="subtitle1">Total Applicants</Typography>
      </Paper>

      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'success.light',
          color: 'success.contrastText',
        }}
      >
        <WorkOutline sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h4" gutterBottom>
          {activeApplicants}
        </Typography>
        <Typography variant="subtitle1">Active Applicants</Typography>
      </Paper>

      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'warning.light',
          color: 'warning.contrastText',
        }}
      >
        <PersonAddOutlined sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h4" gutterBottom>
          {pendingApplicants}
        </Typography>
        <Typography variant="subtitle1">Pending Review</Typography>
      </Paper>

      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'info.light',
          color: 'info.contrastText',
        }}
      >
        <AssignmentTurnedInOutlined sx={{ fontSize: 40, mb: 1 }} />
        <Typography variant="h4" gutterBottom>
          {verifiedApplicants}
        </Typography>
        <Typography variant="subtitle1">Verified</Typography>
      </Paper>
    </Box>
  );
}
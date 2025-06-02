import { useQuery } from 'react-query';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Typography, Button, Chip, Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import { applicantService } from '../api/services/applicant.service';
import { mpService } from '../api/services/mp.service';
import { format } from 'date-fns';

export default function Applications() {
  const { data: applications = [], isLoading: loadingApps } = useQuery('applications', applicantService.getAll);
  const { data: mpsByApplicant = {}, isLoading: loadingMPs } = useQuery(
    'mps-by-applicant',
    async () => {
      const mpsMap: { [key: string]: any[] } = {};
      if (applications.length > 0) {
        await Promise.all(
          applications.map(async (app: any) => {
            const mps = await mpService.getByApplicant(app.applicant_id);
            mpsMap[app.applicant_id] = mps;
          })
        );
      }
      return mpsMap;
    },
    { enabled: applications.length > 0 }
  );

  if (loadingApps || loadingMPs) return <div>Loading...</div>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Job Applications
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Applicant Name</TableCell>
              <TableCell>Mother's Name</TableCell>
              <TableCell>MPs</TableCell>
              <TableCell>Date of Birth</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Contact Info</TableCell>
              <TableCell>Current Location</TableCell>
              <TableCell>ID Documents</TableCell>
              <TableCell>Application Date</TableCell>
              <TableCell>Marital Status</TableCell>
              <TableCell>Highest Education</TableCell>
              <TableCell>School Name</TableCell>
              <TableCell># of Children</TableCell>
              <TableCell>Live With</TableCell>
              <TableCell>Employment Status</TableCell>
              <TableCell>Application Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((app: any) => (
              <TableRow key={app.applicant_id}>
                <TableCell>
                  {`${app.first_name} ${app.midle_name} ${app.last_name}`}
                </TableCell>
                <TableCell>
                  {app.mother_name || '-'}
                </TableCell>
                <TableCell>
                  <Stack direction="column" spacing={1}>
                    {mpsByApplicant[app.applicant_id]?.map((mp: any) => (
                      <Chip
                        key={mp.mp_id}
                        label={`${mp.mp_name} (${mp.mp_type})`}
                        size="small"
                        color={mp.mp_type === 'federal' ? 'primary' : 'secondary'}
                      />
                    )) || '-'}
                  </Stack>
                </TableCell>
                <TableCell>
                  {format(new Date(app.date_of_birth), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  {app.gender || '-'}
                </TableCell>
                <TableCell>
                  <div>{app.email || '-'}</div>
                  <div>{app.mobile_number || '-'}</div>
                </TableCell>
                <TableCell>
                  <div>{app.city_name || '-'}</div>
                  <div>{app.region_name || '-'}</div>
                  <div>{app.state_name || '-'}</div>
                </TableCell>
                <TableCell>
                  <div>NID: {app.national_id_number || '-'}</div>
                  <div>Passport: {app.passport_number || '-'}</div>
                </TableCell>
                <TableCell>
                  {format(new Date(app.created_at), 'MMM d, yyyy HH:mm')}
                </TableCell>
                <TableCell>{app.marital_status || '-'}</TableCell>
                <TableCell>{app.highest_educ || '-'}</TableCell>
                <TableCell>{app.school_name || '-'}</TableCell>
                <TableCell>{app.nbr_of_chil ?? '-'}</TableCell>
                <TableCell>{app.live_with || '-'}</TableCell>
                <TableCell>{app.emp_status || '-'}</TableCell>
                <TableCell>{app.app_status || '-'}</TableCell>
                <TableCell>
                  <Button
                    component={Link}
                    to={`/admin/applicants/${app.applicant_id}`}
                    variant="outlined"
                    size="small"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
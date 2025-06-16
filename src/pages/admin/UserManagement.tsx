import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { apiClient } from '../../utils/apiClient';
import { User } from '../../types/api';

interface UserFormData {
  email: string;
  userType: 'TALENT' | 'SCOUT' | 'ADMIN';
  firstName: string;
  lastName: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    userType: 'TALENT',
    firstName: '',
    lastName: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAllUsers();
      setUsers(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        userType: user.userType,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        userType: 'TALENT',
        firstName: '',
        lastName: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedUser) {
        await apiClient.updateUser(selectedUser.id, formData);
      } else {
        await apiClient.createUser(formData);
      }
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    }
  };

  const handleDelete = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user? This will also delete any associated scout or talent profiles and all related data.')) {
      try {
        
        try {
          const scout = await apiClient.getScoutByUserId(userId);
          if (scout) {
            console.log(`Found scout profile (ID: ${scout.id}) for user ${userId}, deleting...`);
            await apiClient.deleteScout(scout.id);
            console.log(`Scout profile deleted successfully`);
          }
        } catch (scoutError: any) {
          
          if (scoutError.response?.status !== 404) {
            console.warn('Error checking/deleting scout profile:', scoutError);
          }
        }

        
        try {
          const talent = await apiClient.getTalentByUserId(userId);
          if (talent) {
            console.log(`Found talent profile (ID: ${talent.id}) for user ${userId}, deleting...`);
            
            
            try {
              const matchHistory = await apiClient.getMatchHistoryByTalent(talent.id);
              if (matchHistory && matchHistory.length > 0) {
                console.log(`Found ${matchHistory.length} match history records for talent ${talent.id}, deleting...`);
                for (const match of matchHistory) {
                  await apiClient.deleteMatchHistory(match.id);
                }
                console.log(`Match history deleted successfully`);
              }
            } catch (matchError: any) {
              if (matchError.response?.status !== 404) {
                console.warn('Error checking/deleting match history:', matchError);
              }
            }

            
            try {
              const scoutingReports = await apiClient.getScoutingReportsByTalent(talent.id);
              if (scoutingReports && scoutingReports.length > 0) {
                console.log(`Found ${scoutingReports.length} scouting reports for talent ${talent.id}, deleting...`);
                for (const report of scoutingReports) {
                  await apiClient.deleteScoutingReport(report.id);
                }
                console.log(`Scouting reports deleted successfully`);
              }
            } catch (reportError: any) {
              if (reportError.response?.status !== 404) {
                console.warn('Error checking/deleting scouting reports:', reportError);
              }
            }

            
            await apiClient.deleteTalent(talent.id);
            console.log(`Talent profile deleted successfully`);
          }
        } catch (talentError: any) {
          
          if (talentError.response?.status !== 404) {
            console.warn('Error checking/deleting talent profile:', talentError);
          }
        }

        
        await apiClient.deleteUser(userId);
        console.log(`User ${userId} deleted successfully`);
        
        fetchUsers();
      } catch (err: any) {
        console.error('Error during cascade deletion:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete user and associated profiles');
      }
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          User Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add User
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.userType}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(user)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(user.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              fullWidth
            />
            <TextField
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.userType}
                label="Role"
                onChange={(e) => setFormData({ ...formData, userType: e.target.value as 'TALENT' | 'SCOUT' | 'ADMIN' })}
              >
                <MenuItem value="TALENT">Talent</MenuItem>
                <MenuItem value="SCOUT">Scout</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedUser ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement; 
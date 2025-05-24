import { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  MenuItem,
  Grid,
} from '@mui/material';
import { db } from './services/database';

interface Patient {
  id: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
}

function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    phone: '',
    address: '',
  });
  const broadcastRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    // Setup BroadcastChannel for multi-tab sync
    const channel = new BroadcastChannel('patients-sync');
    broadcastRef.current = channel;
    channel.onmessage = (event) => {
      if (event.data === 'reload') {
        loadPatients();
      }
    };
    loadPatients();
    return () => {
      channel.close();
    };
  }, []);

  const loadPatients = async () => {
    try {
      const data = await db.getPatients();
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await db.addPatient(formData);
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: '',
        email: '',
        phone: '',
        address: '',
      });
      loadPatients();
      // Broadcast to other tabs
      broadcastRef.current?.postMessage('reload');
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const results = await db.searchPatients(searchTerm);
      setPatients(results);
    } catch (error) {
      console.error('Error searching patients:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Patient Registration System
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Register New Patient
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="email"
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">
                  Register Patient
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <TextField
              label="Search Patients"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button variant="contained" onClick={handleSearch}>
              Search
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Date of Birth</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      {patient.firstName} {patient.lastName}
                    </TableCell>
                    <TableCell>{patient.dateOfBirth}</TableCell>
                    <TableCell>{patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}</TableCell>
                    <TableCell>
                      {patient.email && <div>{patient.email}</div>}
                      {patient.phone && <div>{patient.phone}</div>}
                    </TableCell>
                    <TableCell>{patient.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
}

export default App; 
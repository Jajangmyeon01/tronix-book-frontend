        import React, { useState, useEffect } from 'react';
        import Sidebar from './Sidebar';
        import EditReservationModal from '../Components/EditReservationModal';
        import ReservationDetails from './ReservationDetails'; // Import the new ReservationDetails component
        import { useNavigate } from 'react-router-dom';
        
        import {
            Box,
            Typography,
            Table,
            TableBody,
            TableCell,
            TableContainer,
            TableHead,
            TableRow,
            Paper,
            IconButton,
            Stack,
            TextField,
            TablePagination,
            Card,
            Snackbar,
            CircularProgress,
        } from '@mui/material';
        import DeleteIcon from '@mui/icons-material/Delete';
        import EditIcon from '@mui/icons-material/Edit';
        import axios from 'axios';
        import Swal from 'sweetalert2';

        function Reservations() {
            const [reservations, setReservations] = useState([]);
            const [searchQuery, setSearchQuery] = useState('');
            const [isEditModalOpen, setIsEditModalOpen] = useState(false);
            const [currentID, setCurrentID] = useState(0);
            const [selectedReservationData, setSelectedReservation] = useState({});
            const [selectedReservationDetails, setSelectedReservationDetails] = useState(null); // State for reservation details
            const [page, setPage] = useState(0);
            const [rowsPerPage, setRowsPerPage] = useState(5);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState(null);
            const navigate = useNavigate();

            

            const getReservations = async () => {
                setLoading(true);
                try {
                    const response = await axios.get('https://api-tronix-reserve.supsofttech.tmc-innovations.com/api/dashboard');
                    const { data } = response.data;
                    const sortedData = data.sort((a, b) => new Date(b.customer.created_at) - new Date(a.customer.created_at));
                    setReservations(sortedData);
                    setLoading(false);
                } catch (error) {
                    setError('Error fetching reservations');
                    setLoading(false);
                }
            };

            const handleDelete = async (id) => {
                try {
                    const result = await Swal.fire({
                        title: 'Are you sure?',
                        text: "You won't be able to revert this!",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#3085d6',
                        cancelButtonColor: '#d33',
                        confirmButtonText: 'Yes, delete it!',
                    });

                    if (result.isConfirmed) {
                        await axios.delete(`https://api-tronix-reserve.supsofttech.tmc-innovations.com/api/dashboard/${id}`);
                        Swal.fire({
                            title: 'Reservation Deleted!',
                            text: 'Your reservation has been successfully deleted.',
                            icon: 'success',
                        });
                        getReservations();
                    }
                } catch (error) {
                    setError('Error deleting reservation');
                }
            };

            useEffect(() => {
                getReservations();
                
            }, []);

            const getStatusLabel = (status) => {
                switch (status) {
                    case 'R':
                        return 'Reserved';
                    case 'S':
                        return 'Success';
                    case 'C':
                        return 'Cancelled';
                    default:
                        return 'Unknown Status';
                }
            };

            const filteredReservations = reservations.filter((reservation) => {
                const combinedFields = `${reservation.customer.reservation_id} ${reservation.customer.first_name} ${reservation.customer.last_name} ${reservation.customer.email}`.toLowerCase();
                return combinedFields.includes(searchQuery.toLowerCase());
            });

            const handleChangePage = (event, newPage) => {
                setPage(newPage);
            };

            const handleChangeRowsPerPage = (event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
            };

            const paginatedReservations = filteredReservations.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

            const tdSx = { fontWeight: 'bold', fontSize: '0.85rem', padding: '8px' },
                tdSx2 = { fontSize: '0.8rem', padding: '6px' };

            return (
                <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                    <Sidebar />
                    <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            Reservations
                        </Typography>

                        {/* Search Area */}
                        <Card sx={{ p: 2, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Search Reservations
                            </Typography>
                            <TextField
                                label="Search by Name, ID, Email"
                                variant="outlined"
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                fullWidth
                            />
                        </Card>

                        {/* Loading Spinner */}
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                <TablePagination
                                    component="div"
                                    count={filteredReservations.length}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[5, 10, 25]}
                                />

                               
                                
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} size="small" aria-label="reservation table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={tdSx}>Reservation ID</TableCell>
                                                <TableCell sx={tdSx}>First Name</TableCell>
                                                <TableCell sx={tdSx}>Last Name</TableCell>
                                                <TableCell sx={tdSx}>Email</TableCell>
                                                <TableCell sx={tdSx}>Date</TableCell>
                                                <TableCell sx={tdSx}>Time</TableCell>
                                                <TableCell sx={tdSx}>Venue</TableCell>
                                                <TableCell sx={tdSx}>Status</TableCell>
                                                <TableCell sx={tdSx}>Created At</TableCell>
                                                <TableCell sx={tdSx}>Updated At</TableCell>
                                                <TableCell sx={tdSx}>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                        {paginatedReservations.length > 0 ? (
                                            paginatedReservations.map((reservation) => (
                                            <TableRow
                                                key={reservation.id}
                                                hover
                                                sx={{
                                                transition: 'all 0.2s',
                                                '&:hover': { backgroundColor: '#f1f1f1' },
                                                cursor: 'pointer', // Make the entire row clickable
                                                }}
                                                onClick={() => navigate(`/reservation-details/${reservation.id}`)} // Navigate to ReservationDetails on row click
                                            >
                                                {/* Reservation ID */}
                                                <TableCell
                                                sx={{
                                                    ...tdSx2,
                                                    color: '#428bca',
                                                    cursor: 'pointer', // Indicate it's clickable
                                                    '&:hover': {
                                                    textDecoration: 'underline',
                                                    textDecorationColor: '#428bca',
                                                    },
                                                }}
                                                >
                                                {reservation.customer.reservation_id}
                                                </TableCell>

                                                {/* Customer First Name */}
                                                <TableCell sx={tdSx2}>{reservation.customer.first_name}</TableCell>

                                                {/* Customer Last Name */}
                                                <TableCell sx={tdSx2}>{reservation.customer.last_name}</TableCell>

                                                {/* Customer Email */}
                                                <TableCell
                                                sx={{
                                                    ...tdSx2,
                                                    color: '#428bca',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                    textDecoration: 'underline',
                                                    textDecorationColor: '#428bca',
                                                    },
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent row click
                                                    navigate(`/reservation-details/${reservation.id}`);
                                                }}
                                                >
                                                {reservation.customer.email}
                                                </TableCell>

                                                {/* Reservation Date */}
                                                <TableCell sx={tdSx2}>{reservation.customer.date}</TableCell>

                                                {/* Reservation Time */}
                                                <TableCell sx={tdSx2}>{reservation.customer.time}</TableCell>

                                                {/* Venue */}
                                                <TableCell sx={tdSx2}>{reservation.customer.venue}</TableCell>

                                                {/* Status */}
                                                <TableCell
                                                sx={{
                                                    ...tdSx2,
                                                    color: '#428bca',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                    textDecoration: 'underline',
                                                    textDecorationColor: '#428bca',
                                                    },
                                                }}
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent row click
                                                    navigate(`/reservation-details/${reservation.id}`);
                                                }}
                                                >
                                                {getStatusLabel(reservation.status)}
                                                </TableCell>

                                                {/* Created At */}
                                                <TableCell sx={tdSx2}>{reservation.customer.created_at}</TableCell>

                                                {/* Updated At */}
                                                <TableCell sx={tdSx2}>{reservation.customer.updated_at}</TableCell>

                                                {/* Action Buttons */}
                                                <TableCell>
                                                <Stack direction="row" spacing={1}>
                                                    {/* Edit Button */}
                                                    <IconButton
                                                    color="primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row click
                                                        setCurrentID(reservation.id);
                                                        setSelectedReservation(reservation);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    size="small"
                                                    >
                                                    <EditIcon fontSize="small" />
                                                    </IconButton>

                                                    {/* Delete Button */}
                                                    <IconButton
                                                    color="secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row click
                                                        handleDelete(reservation.id);
                                                    }}
                                                    size="small"
                                                    >
                                                    <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                                </TableCell>
                                            </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                            <TableCell colSpan={10} align="center">
                                                No Reservations Found
                                            </TableCell>
                                            </TableRow>
                                        )}
                                        </TableBody>


                                    </Table>
                                </TableContainer>

                                <TablePagination
                                    component="div"
                                    count={filteredReservations.length}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                    rowsPerPageOptions={[5, 10, 25]}
                                />
                            </>
                        )}

                        {/* Snackbar for error feedback */}
                        <Snackbar
                            open={!!error}
                            autoHideDuration={6000}
                            onClose={() => setError(null)}
                            message={error}
                        />

                        {/* Modal for editing */}
                        <EditReservationModal
                            open={isEditModalOpen}
                            onClose={() => setIsEditModalOpen(false)}
                            reservationData={selectedReservationData}
                        
                            onRefresh={getReservations} // Callback to refresh the reservations list
                        />

                        {/* Reservation Details Component */}
                        {selectedReservationDetails && (
                            <ReservationDetails
                                reservation={selectedReservationDetails}
                                onClose={() => setSelectedReservationDetails(null)} // Close details view
                            />
                        )}
                    </Box>
                </Box>
            );
        }

        export default Reservations;

import React from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { theme } from '../app/styles/theme';
import rollingStockData from '../data/rolling-stock.json';

const RollingStockPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Rolling Stock Inventory
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          View and manage your rolling stock inventory
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ boxShadow: theme.shadows[1] }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Road Name</TableCell>
              <TableCell>Road Number</TableCell>
              <TableCell>AAR Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rollingStockData.map((item) => (
              <TableRow key={item._id.$oid}>
                <TableCell>{item.roadName}</TableCell>
                <TableCell>{item.roadNumber}</TableCell>
                <TableCell>{item.aarType}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.color}</TableCell>
                <TableCell>{item.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default RollingStockPage; 
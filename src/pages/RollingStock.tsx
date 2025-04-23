"use client";

import React, { useState } from 'react';
import { Box, Container, Typography, Card, CardContent, Chip, FormControl, InputLabel, Select, MenuItem, OutlinedInput, SelectChangeEvent } from '@mui/material';
import Grid from '@mui/material/Grid';
import rollingStockData from '../data/rolling-stock.json';

const RollingStockPage: React.FC = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Get unique AAR types from the data
  const aarTypes = Array.from(new Set(rollingStockData.map(item => item.aarType))).sort();

  // Filter rolling stock based on selected types
  const filteredRollingStock = selectedTypes.length > 0
    ? rollingStockData.filter(item => selectedTypes.includes(item.aarType))
    : rollingStockData;

  const handleTypeChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedTypes(typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          Rolling Stock Inventory
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          View and manage your rolling stock inventory
        </Typography>
      </Box>

      <Box sx={{ mb: 4 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel id="aar-type-filter-label">Filter by AAR Type</InputLabel>
          <Select
            labelId="aar-type-filter-label"
            multiple
            value={selectedTypes}
            onChange={handleTypeChange}
            input={<OutlinedInput label="Filter by AAR Type" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {aarTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3} sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
        {filteredRollingStock.map((item) => (
          <Box 
            key={item._id.$oid}
            component="article"
            sx={{
              height: '100%',
              display: 'flex'
            }}
          >
            <Card 
              sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                  transition: 'box-shadow 0.3s ease-in-out'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="div" color="primary">
                    {item.roadName} {item.roadNumber}
                  </Typography>
                  <Chip 
                    label={item.aarType}
                    size="small"
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
                
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  {item.description}
                </Typography>

                <Box sx={{ mt: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={item.color}
                    size="small"
                    sx={{ 
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                  {item.note && (
                    <Chip 
                      label={item.note}
                      size="small"
                      sx={{ 
                        bgcolor: 'background.default',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Grid>
    </Container>
  );
};

export default RollingStockPage; 
import React from 'react';
import { Box, Container, Typography, Card, CardContent, Chip } from '@mui/material';
import Grid from '@mui/material/Grid';
import rollingStockData from '../data/rolling-stock.json';

const RollingStockPage: React.FC = () => {
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

      <Grid container spacing={3}>
        {rollingStockData.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item._id.$oid}>
            <Box component="article">
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                    transition: 'box-shadow 0.3s ease-in-out'
                  }
                }}
              >
                <CardContent>
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

                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default RollingStockPage; 
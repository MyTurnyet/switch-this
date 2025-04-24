import { Typography, Container, List, ListItem, Paper, Box, Link } from '@mui/material';

const About = () => {
  return (
    <Container component="main" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Switch This
        </Typography>

        <Box mb={4}>
          <Typography variant="h4" component="h2" gutterBottom>
            Overview
          </Typography>
          <Typography variant="body1">
            Switchlist Generator is a web-based tool designed to streamline the creation and management
            of railroad switchlists. Built with modern web technologies, it provides an intuitive
            interface for railroad operators to efficiently manage their operations.
          </Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h4" component="h2" gutterBottom>
            Key Features
          </Typography>
          <List aria-label="key features list">
            <ListItem>
              <Typography variant="body1">Modern UI - Clean, responsive interface built with Material-UI</Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">Industry Management - Comprehensive tools for managing railroad industries</Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">Location Tracking - Efficient tracking of cars and their locations</Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">Responsive Design - Seamless experience across all devices</Typography>
            </ListItem>
          </List>
        </Box>

        <Box>
          <Typography variant="h4" component="h2" gutterBottom>
            Tech Stack
          </Typography>
          <List>
            <ListItem>
              <Typography variant="body1">
                <Link href="https://nextjs.org" target="_blank" rel="noopener noreferrer">Next.js</Link>
                {' '}- React framework for production
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <Link href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer">TypeScript</Link>
                {' '}- For type-safe code
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <Link href="https://mui.com" target="_blank" rel="noopener noreferrer">Material-UI</Link>
                {' '}- Component library for consistent design
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">Jest & React Testing Library - For reliable testing</Typography>
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Container>
  );
};

export default About;
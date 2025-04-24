import { Typography, Container, List, ListItem, Paper, Box } from '@mui/material';

const About = () => {
  return (
    <Container component="main" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          A Modern Solution for a Timeless Hobby
        </Typography>

        <Box mb={4}>
          <Typography variant="body1" paragraph>
            Switch This is a web-based application purpose-built to help model railroaders generate and manage switchlists with ease and precision. Whether you&apos;re managing a large, operations-heavy layout or a small switching module, Switch This gives you the tools to simulate realistic freight operations without the hassle of spreadsheets or paper-based methods.
          </Typography>
          <Typography variant="body1" paragraph>
            Crafted with modern web technologies and a deep appreciation for railroading, Switch This brings a new level of efficiency and enjoyment to model railroad operations.
          </Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h4" component="h2" gutterBottom>
            Why Switch This?
          </Typography>
          <Typography variant="body1" paragraph>
            Creating and managing switchlists is one of the most rewarding—and often time-consuming—parts of operating a model railroad. Traditional methods can be manual, inconsistent, and hard to scale. Switch This was born out of a desire to solve these problems with thoughtful software.
          </Typography>
          <Typography variant="body1" paragraph>
            The result is a responsive, user-friendly tool that takes care of the logistics so you can focus on the fun of running trains. From yardmasters to lone operators, Switch This adapts to your style and layout size.
          </Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h4" component="h2" gutterBottom>
            Meet the Creator: Paige Watson
          </Typography>
          <Typography variant="body1" paragraph>
            Hi, I&apos;m Paige Watson, the developer behind Switch This—and a lifelong railfan and model railroad enthusiast. I built this application to bring the same level of care, attention to detail, and engineering discipline to railroad operations software that I bring to my professional work as a software developer.
          </Typography>
          <Typography variant="body1" paragraph>
            My background includes leading software teams in building scalable, maintainable, and high-quality applications across industries. I&apos;m a strong advocate for treating software as a craft—balancing innovation with reliability, and always building with the future in mind. I&apos;ve spoken at global conferences, led workshops on software development best practices, and helped teams grow into high-performing units that deliver with confidence and speed.
          </Typography>
          <Typography variant="body1">
            That same philosophy is reflected in Switch This: thoughtful design, user-centric functionality, and a foundation built for future growth.
          </Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h4" component="h2" gutterBottom>
            Core Principles
          </Typography>
          <Typography variant="h5" component="h3" gutterBottom>
            Software as Craft
          </Typography>
          <Typography variant="body1" paragraph>
            Built using quality development practices like Test-Driven Development (TDD), clean architecture, and modular design, Switch This is designed to be as robust under the hood as it is pleasant to use.
          </Typography>
          <Typography variant="h5" component="h3" gutterBottom>
            User-Centered Design
          </Typography>
          <Typography variant="body1" paragraph>
            Every feature in Switch This is designed with operators in mind—based on real-world usage, community feedback, and a desire to make operations more immersive and manageable.
          </Typography>
          <Typography variant="h5" component="h3" gutterBottom>
            Sustainable Growth
          </Typography>
          <Typography variant="body1">
            Switch This isn&apos;t a one-and-done project. It&apos;s a living application that will continue to evolve with the needs of the model railroading community.
          </Typography>
        </Box>

        <Box mb={4}>
          <Typography variant="h4" component="h2" gutterBottom>
            Key Features
          </Typography>
          <List>
            <ListItem>
              <Typography variant="body1">
                <strong>Modern, Intuitive UI</strong> - Clean, responsive interface using Material-UI and modern design standards.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>Industry & Spot Management</strong> - Easily define industries, assign car types, and manage specific spot locations for realistic switchlists.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>Location-Aware Car Tracking</strong> - Know exactly where each car is and where it needs to go—streamlining operations and reducing confusion.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>Device-Ready</strong> - Works across desktops, tablets, and smartphones so your railroad can operate anywhere.
              </Typography>
            </ListItem>
            <ListItem>
              <Typography variant="body1">
                <strong>Data You Control</strong> - Your data stays yours. Import/export functionality ensures flexibility and longevity.
              </Typography>
            </ListItem>
          </List>
        </Box>

        <Box>
          <Typography variant="h4" component="h2" gutterBottom>
            Committed to the Community
          </Typography>
          <Typography variant="body1" paragraph>
            As an active member of both the software development and model railroading communities, I&apos;m dedicated to making Switch This not just a tool—but a platform for learning, sharing, and evolving how we run our railroads.
          </Typography>
          <Typography variant="body1" paragraph>
            If you have feedback, feature requests, or just want to connect and talk ops, I&apos;d love to hear from you.
          </Typography>
          <Typography variant="body1" paragraph>
            Thanks for being part of the journey—and happy switching.
          </Typography>
          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
            —Paige
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default About;
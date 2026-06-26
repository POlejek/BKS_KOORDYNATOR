import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

/** Łapie błędy renderowania React i pokazuje przyjazny komunikat zamiast białego ekranu. */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Błąd interfejsu:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8, px: 2 }}>
          <Paper sx={{ p: 4, maxWidth: 480, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Coś poszło nie tak
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Wystąpił nieoczekiwany błąd. Odśwież stronę i spróbuj ponownie.
            </Typography>
            <Button variant="contained" onClick={this.handleReset}>
              Odśwież
            </Button>
          </Paper>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

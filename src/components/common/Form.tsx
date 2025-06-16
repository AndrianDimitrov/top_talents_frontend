import { ReactNode } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';

interface FormProps {
  title?: string;
  onSubmit: (data: any) => void;
  children: ReactNode;
  submitLabel?: string;
  isLoading?: boolean;
  error?: string | null;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Form = ({
  title,
  onSubmit,
  children,
  submitLabel = 'Submit',
  isLoading = false,
  error = null,
  maxWidth = 'sm',
}: FormProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: maxWidth,
        mx: 'auto',
      }}
    >
      <Paper sx={{ p: 3, width: '100%' }}>
        {title && (
          <Typography component="h1" variant="h5" gutterBottom align="center">
            {title}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={onSubmit} noValidate>
          {children}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{ mt: 3, mb: 2 }}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              submitLabel
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Form; 
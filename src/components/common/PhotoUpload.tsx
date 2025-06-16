import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { apiClient } from '../../utils/apiClient';

interface PhotoUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  label?: string;
  disabled?: boolean;
  talentId?: number;
}

const PhotoUpload = ({
  onUploadComplete,
  onUploadError,
  maxSize = 5 * 1024 * 1024, // 5MB default
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif'],
  label = 'Upload Photo',
  disabled = false,
  talentId,
}: PhotoUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

  
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

   
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    
    try {
      setLoading(true);
      setError(null);

      if (!talentId) {
        throw new Error('Talent ID is required for photo upload');
      }

      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid authentication token. Please log in again.');
      }

      const photoUrl = await apiClient.uploadTalentPhoto(talentId, file);
      onUploadComplete(photoUrl);
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      let errorMessage = 'Failed to upload photo';
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'You are not authorized to upload photos';
      } else if (err.response?.status === 404) {
        errorMessage = 'Talent profile not found';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      onUploadError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [maxSize, onUploadComplete, onUploadError, talentId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles: 1,
    disabled: loading || disabled,
  });

  const handleRemove = () => {
    setPreview(null);
    onUploadComplete('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (preview) {
    return (
      <Box sx={{ position: 'relative', width: 'fit-content' }}>
        <Box
          component="img"
          src={preview}
          alt="Preview"
          sx={{
            width: 200,
            height: 200,
            objectFit: 'cover',
            borderRadius: 1,
          }}
        />
        <IconButton
          onClick={handleRemove}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 1,
          p: 3,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          '&:hover': {
            borderColor: disabled ? 'grey.300' : 'primary.main',
            bgcolor: disabled ? 'background.paper' : 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" gutterBottom>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Drag and drop a photo here, or click to select
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Supported formats: {acceptedFileTypes.map(type => type.split('/')[1]).join(', ')}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block">
          Max size: {maxSize / 1024 / 1024}MB
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default PhotoUpload; 
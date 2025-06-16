import {
  Box,
  Typography,
  Rating as MuiRating,
  Tooltip,
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

interface RatingDisplayProps {
  value: number;
  precision?: number;
  max?: number;
  readOnly?: boolean;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
  onChange?: (value: number | null) => void;
  tooltip?: string;
}

export default function RatingDisplay({
  value,
  precision = 0.5,
  max = 5,
  readOnly = true,
  size = 'medium',
  showValue = false,
  onChange,
  tooltip,
}: RatingDisplayProps) {
  const rating = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <MuiRating
        value={value}
        precision={precision}
        max={max}
        readOnly={readOnly}
        size={size}
        onChange={(_, newValue) => onChange?.(newValue)}
        icon={<StarIcon fontSize="inherit" />}
        emptyIcon={<StarIcon fontSize="inherit" />}
      />
      {showValue && (
        <Typography variant="body2" color="text.secondary">
          {value.toFixed(1)}/{max}
        </Typography>
      )}
    </Box>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {rating}
      </Tooltip>
    );
  }

  return rating;
} 
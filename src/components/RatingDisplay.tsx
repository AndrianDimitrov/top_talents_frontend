import { Box, Typography } from '@mui/material';
import { Star as StarIcon, StarBorder as StarBorderIcon } from '@mui/icons-material';

interface RatingDisplayProps {
  value: number;
  maxValue?: number;
  size?: 'small' | 'medium' | 'large';
  showValue?: boolean;
}

const RatingDisplay = ({
  value,
  maxValue = 5,
  size = 'medium',
  showValue = true,
}: RatingDisplayProps) => {
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'large':
        return 32;
      default:
        return 24;
    }
  };

  const stars = [];
  const iconSize = getIconSize();

  for (let i = 1; i <= maxValue; i++) {
    stars.push(
      i <= value ? (
        <StarIcon
          key={i}
          sx={{ fontSize: iconSize, color: 'warning.main' }}
        />
      ) : (
        <StarBorderIcon
          key={i}
          sx={{ fontSize: iconSize, color: 'warning.main' }}
        />
      )
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {stars}
      {showValue && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ ml: 1 }}
        >
          {value.toFixed(1)}
        </Typography>
      )}
    </Box>
  );
};

export default RatingDisplay; 
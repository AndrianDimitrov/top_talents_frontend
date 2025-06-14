import {
  Card as MuiCard,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import { ReactNode } from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  content: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  tooltip?: string;
}

const Card = ({
  title,
  subtitle,
  content,
  actions,
  icon,
  onClick,
  tooltip,
}: CardProps) => {
  const cardContent = (
    <MuiCard
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Box>{content}</Box>
      </CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </MuiCard>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {cardContent}
      </Tooltip>
    );
  }

  return cardContent;
};

export default Card; 
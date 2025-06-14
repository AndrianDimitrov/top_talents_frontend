import { useForm, Controller, FieldValues } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import Form from '../common/Form';
import PhotoUpload from '../common/PhotoUpload';

type TalentFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  position: string;
  height: number;
  weight: number;
  nationality: string;
  preferredFoot: 'left' | 'right' | 'both';
  photo?: string | null;
};

const schema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  dateOfBirth: yup.string().required('Date of birth is required'),
  position: yup.string().required('Position is required'),
  height: yup
    .number()
    .required('Height is required')
    .min(150, 'Height must be at least 150cm')
    .max(220, 'Height must be at most 220cm'),
  weight: yup
    .number()
    .required('Weight is required')
    .min(40, 'Weight must be at least 40kg')
    .max(120, 'Weight must be at most 120kg'),
  nationality: yup.string().required('Nationality is required'),
  preferredFoot: yup
    .mixed<'left' | 'right' | 'both'>()
    .oneOf(['left', 'right', 'both'])
    .required('Preferred foot is required'),
  photo: yup.string().nullable().optional(),
}) as yup.ObjectSchema<TalentFormValues>;

interface TalentFormProps {
  initialData?: Partial<TalentFormValues>;
  onSubmit: (data: FieldValues) => void;
  isLoading?: boolean;
  error?: string | null;
}

const TalentForm = ({
  initialData,
  onSubmit,
  isLoading = false,
  error = null,
}: TalentFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TalentFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      position: '',
      height: 170,
      weight: 70,
      nationality: '',
      preferredFoot: 'right',
      ...initialData,
    },
  });

  return (
    <Form
      title={initialData ? 'Edit Talent Profile' : 'Create Talent Profile'}
      onSubmit={handleSubmit(onSubmit)}
      isLoading={isLoading}
      error={error}
    >
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="photo"
            control={control}
            render={({ field: { onChange } }) => (
              <PhotoUpload
                onUploadComplete={onChange}
                onUploadError={(error) => console.error(error)}
                label="Upload Profile Photo"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="First Name"
                fullWidth
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Last Name"
                fullWidth
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Date of Birth"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.position}>
                <InputLabel>Position</InputLabel>
                <Select {...field} label="Position">
                  <MenuItem value="Goalkeeper">Goalkeeper</MenuItem>
                  <MenuItem value="Defender">Defender</MenuItem>
                  <MenuItem value="Midfielder">Midfielder</MenuItem>
                  <MenuItem value="Forward">Forward</MenuItem>
                </Select>
                {errors.position && (
                  <FormHelperText>{errors.position.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="height"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Height (cm)"
                type="number"
                fullWidth
                error={!!errors.height}
                helperText={errors.height?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="weight"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Weight (kg)"
                type="number"
                fullWidth
                error={!!errors.weight}
                helperText={errors.weight?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="nationality"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Nationality"
                fullWidth
                error={!!errors.nationality}
                helperText={errors.nationality?.message}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Controller
            name="preferredFoot"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.preferredFoot}>
                <InputLabel>Preferred Foot</InputLabel>
                <Select {...field} label="Preferred Foot">
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                  <MenuItem value="both">Both</MenuItem>
                </Select>
                {errors.preferredFoot && (
                  <FormHelperText>{errors.preferredFoot.message}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </Grid>
      </Grid>
    </Form>
  );
};

export default TalentForm; 
import { styled } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { Box, Typography } from '@mui/material';

export const BorderLinearProgress = styled(LinearProgress)(() => ({
  height: 5,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: 'rgba(76, 175, 80,0.2)',
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#4caf50',
  },
}));

export const ProgressBar = ({progress}: { progress: number }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        textAlign: 'end',
        visibility: progress >= 0 && progress <= 100 ? 'visible' : 'hidden',
      }}
    >
      <Box sx={{width: '100%'}}>
        <BorderLinearProgress variant='determinate' value={progress} />
      </Box>
      <Box sx={{minWidth: 40}}>
        <Typography variant='body2'>{`${progress}%`}</Typography>
      </Box>
    </Box>
  );
};
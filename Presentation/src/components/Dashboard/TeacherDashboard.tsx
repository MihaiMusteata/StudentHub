import VisibilityIcon from '@mui/icons-material/Visibility';
import { useEffect, useState } from 'react';
import { ApiGetRequest } from '../../scripts/api.tsx';
import { Course } from '../Course/CoursePage.tsx';
import { Link } from 'react-router-dom';
import Courses from '../Course/Courses.tsx';

const TeacherDashboard = ({userId}: { userId: string }) => {
  return (
    <>
      <Courses userId={userId}/>
    </>
  );
};
export default TeacherDashboard;
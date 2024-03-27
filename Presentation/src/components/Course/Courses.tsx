import VisibilityIcon from '@mui/icons-material/Visibility';
import { useEffect, useState } from 'react';
import { ApiGetRequest } from '../../scripts/api.tsx';
import { Course } from './CoursePage.tsx';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/userContext.tsx';

const listItem = ({id, code, name, description, enrolledGroups, discipline}: Course) => {

  return (
    <>
      <div className='d-flex flex-column'>
        <h6 className='mb-3 text-sm'>{code + ' ' + name}</h6>
        <span className='mb-2 text-xs'>Description: <span className='text-dark font-weight-bold ms-sm-2'>{description}</span></span>
        <span className='mb-2 text-xs'>Enrolled Groups: <span className='text-dark ms-sm-2 font-weight-bold'>{enrolledGroups}</span></span>
        <span className='text-xs'>Discipline: <span className='text-dark ms-sm-2 font-weight-bold'>{discipline}</span></span>
      </div>
      <div className='ms-auto text-end d-flex flex-column justify-content-center'>
        <Link to={`/courses/course?id=${id}`}>
          <div className='btn btn-link text-danger text-gradient px-3 mb-0'>
            <VisibilityIcon className='fs-5 me-1' />
            <span>View</span>
          </div>
        </Link>
      </div>
    </>
  );
};

const Courses = () => {
  const [ teacher, setTeacher ] = useState<any>({});
  const [ courses, setCourses ] = useState<Course[]>([]);
  const {user} = useUser();
  const fetchTeacher = async () => {
    try {
      const result = await ApiGetRequest('teacherByUserId', {userId: user?.id});
      if (result.status === 200) {
        setTeacher(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCourses = async () => {
    try {
      const result = await ApiGetRequest('teacherCourses', {teacherId: teacher.id});
      if (result.status === 200) {
        result.body.map((course: any) => {
          if (course.enrolledGroups.length === 0) {
            course.enrolledGroups = 'None';
            return;
          }
          course.enrolledGroups = course.enrolledGroups.join(', ');
        });
        setCourses(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTeacher();
  }, [ user?.id ]);

  useEffect(() => {
    if (teacher.id) {
      fetchCourses();
    }
  }, [ teacher.id ]);

  return (
    <>
      <div className='container-fluid py-4'>
        <div className='row'>
          <div className='col-12 mt-4'>
            <div className='card'>
              <div className='card-header pb-0 px-3'>
                <h6 className='mb-0'>Courses Information</h6>
              </div>
              <div className='card-body pt-4 p-3'>
                <ul className='list-group'>
                  {
                    courses.map((course, index) => {
                      return (
                        <li
                          key={index}
                          className='list-group-item border-0 d-flex p-4 mb-4 bg-gray-100 border-radius-lg'
                        >
                          {listItem(course)}
                        </li>
                      );
                    })
                  }
                </ul>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
};
export default Courses;
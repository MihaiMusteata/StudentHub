import { useUser } from '../../context/userContext.tsx';
import { ApiGetRequest } from '../../scripts/api.tsx';
import { useEffect, useState } from 'react';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Flex, Progress } from 'antd';
import { Course } from '../Course/CoursePage.tsx';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';

interface Grade {
  gradeItem: string;
  grade: number;
}

interface CourseGrade extends Course {
  grades: Grade[];
  totalAssignments: number;
}

const Grades = () => {
  const [ student, setStudent ] = useState<any>({});
  const [ courses, setCourses ] = useState<CourseGrade[]>([]);

  const {user} = useUser();

  const navigate = useNavigate();
  const fetchStudent = async () => {
    try {
      const result = await ApiGetRequest('studentByUserId', {userId: user!.id});
      if (result.status === 200) {
        setStudent(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchGrades = async (courseId: number) => {
    try {
      const result = await ApiGetRequest('studentGrades', {courseId: courseId, studentId: student.id});
      return result.body;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTotalAsignments = async (courseId: number) => {
    try {
      const result = await ApiGetRequest('totalAssignments', {courseId: courseId});
      return result.body;
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCourses = async () => {
    try {
      const result = await ApiGetRequest('studentCourses', {studentId: student.id});
      if (result.status === 200) {
        await Promise.all(result.body.map(async (course: any) => {
          course.grades = await fetchGrades(course.id);
          course.totalAssignments = await fetchTotalAsignments(course.id);

          if (course.teachers) {
            course.teachers = course.teachers.join(', ');
          }
        }));
        setCourses(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const CalculateProgress = (course: CourseGrade) => {
    return Math.round((course.grades.length / course.totalAssignments) * 100);
  }

  useEffect(() => {
    fetchStudent();
  }, []);

  useEffect(() => {
    if (student.id) {
      fetchCourses();
    }
  }, [ student.id ]);

  console.log('Courses:', courses);
  return (
    <div className='container-fluid py-4'>
      <div className='row'>
        <div className='col-12'>
          <div className='card my-4'>
            <div className='card-header p-0 position-relative mt-n4 mx-3 z-index-2'>
              <div className='d-flex justify-content-between align-items-center bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3 px-3'>
                <h4 className='text-white text-capitalize mb-0'>Courses I am taking</h4>
                <button
                  className='btn bg-gradient-warning btn-sm mb-0 shadow d-flex align-items-center justify-content-center'
                >
                  <AddCircleOutlineIcon className='fs-5 me-1' />
                  <span>Add</span>
                </button>
              </div>
            </div>
            <div className='card-body px-0 pb-2'>
              <div className='table-responsive p-0'>
                <table className='table align-items-center mb-0'>
                  <thead>
                  <tr>
                    <th className='text-secondary opacity-7 align-middle text-center'>Courses</th>
                    <th className='text-secondary opacity-7 align-middle text-center'>Progress</th>
                    <th className='text-secondary opacity-7 align-middle text-center'>View</th>
                  </tr>
                  </thead>
                  <tbody>
                  {
                    courses.map((course, index) => (
                      <tr key={index}>
                        <td className='align-middle text-center'>{course.name}</td>
                        <td className='align-middle text-center'>
                          <Flex gap='small' vertical>
                            <Progress percent={CalculateProgress(course)} status={CalculateProgress(course) === 100 ? 'success' : 'active'} />
                          </Flex>
                        </td>
                        <td className='d-flex justify-content-center align-middle  align-items-center text-center'>
                          <button
                            className='btn bg-gradient-info btn-sm ms-2 mb-0 d-flex align-items-center justify-content-center'
                            onClick={() => navigate(`/grades/course?id=${course.id}`)}
                          >
                            <VisibilityIcon className='fs-5 me-1' />
                            <span>Full info</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Grades;
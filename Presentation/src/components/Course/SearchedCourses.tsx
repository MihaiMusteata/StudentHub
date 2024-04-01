import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ApiGetRequest } from '../../scripts/api.tsx';
import { Course } from './CoursePage.tsx';
import { Tooltip } from 'antd';
import EnhancedEncryptionTwoToneIcon from '@mui/icons-material/EnhancedEncryptionTwoTone';
import { useUser } from '../../context/userContext.tsx';
import EnterAccessKeyModal from './CourseComponents/EnterAccessKeyModal.tsx';

export interface EnrollData {
  courseId: number;
  studentId: string;
  accessKey: string;
}
const SearchedCourses = () => {
  const [ courses, setCourses ] = useState<Course[]>([]);
  const [ student, setStudent ] = useState<any>();
  const [ enrollData, setEnrollData ] = useState<EnrollData>({ courseId: 0, studentId: '', accessKey: '' });
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const {user} = useUser();
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const course = searchParams.get('course');

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
  
  const fetchCourses = async () => {
    try {
      const result = await ApiGetRequest('searchCourses', {search: course});
      if (result.status === 200) {
        setCourses(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const handleEnroll = (id: number) => {
    setEnrollData({ courseId: id, studentId: student.id, accessKey: '' });
    setIsModalOpen(true);
  }

  useEffect(() => {
    fetchCourses();
  }, []);
  
  useEffect(() => {
    fetchStudent();
  }, []);

  return (
    <>
      <div className='container-fluid py-4'>
        <div className='row'>
          <div className='col-12 mt-4'>
            <div className='card'>
              <div className='card-header pb-0 px-3'>
                <h5 className='mb-0'>Search Results</h5>
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
                          <div className='d-flex flex-column'>
                            <h6 className='mb-3 text-md'>{course.code + ' ' + course.name}</h6>
                            <span className='mb-2 text-sm'>Description: <span className='text-dark font-weight-bold ms-sm-2'>{course.description}</span></span>
                            <span className='mb-2 text-sm'>Teachers: <span className='text-dark ms-sm-2 font-weight-bold'>{course.teachers}</span></span>
                            <span className='text-sm'>Discipline: <span className='text-dark ms-sm-2 font-weight-bold'>{course.discipline}</span></span>
                          </div>
                          <div className='ms-auto text-end d-flex flex-column justify-content-center'>
                            <div className='btn btn-link text-info text-gradient px-3 mb-0'>
                              <div className='cursor-pointer'>
                                <Tooltip key={index} title={`Enroll in ${course.name}`} placement='top'>
                                  <div onClick={() => handleEnroll(course.id)}>
                                    <EnhancedEncryptionTwoToneIcon />
                                  </div>
                                </Tooltip>
                              </div>
                            </div>
                          </div>
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
      {
        isModalOpen && (
          <EnterAccessKeyModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            enrollData={enrollData}
          />
        )
      }
    </>
  );
};
export default SearchedCourses;
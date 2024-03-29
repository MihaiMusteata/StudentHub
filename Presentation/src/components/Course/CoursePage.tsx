import { Divider } from 'antd';
import AddIcon from '@mui/icons-material/Add';
import Lesson, { LessonData } from './CourseComponents/LessonComponents/Lesson.tsx';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiGetRequest } from '../../scripts/api.tsx';
import AddNewLessonModal from './CourseComponents/LessonComponents/AddNewLessonModal.tsx';
import { useUser } from '../../context/userContext.tsx';

export interface Course {
  id: number,
  discipline: string
  name: string,
  description: string,
  code: string,
  enrolledGroups: string,
}

const CoursePage = () => {
  const [ course, setCourse ] = useState<Course | undefined>(undefined);
  const [ lessons, setLessons ] = useState<LessonData[]>([]);
  const [ isAddModalOpen, setIsAddModalOpen ] = useState<boolean>(false);
  const {user} = useUser();

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id') as unknown as number;

  const fetchLessons = async () => {
    try {
      const result = await ApiGetRequest('courseLessons', {courseId: id});
      if (result.status === 200) {
        console.log('Lessons:', result.body);
        setLessons(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const AddNewLesson = () => {
    setIsAddModalOpen(true);
  };

  const fetchCourse = async () => {
    try {
      const result = await ApiGetRequest('course', {id: id});
      if (result.status === 200) {
        setCourse(result.body);
      } else {
        navigate('/courses');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteLesson = (lessonId: number) => {
    setLessons(prevLessons => prevLessons.filter(lesson => lesson.id !== lessonId));
  };

  const handleEditLesson = (newLesson: LessonData) => {
    setLessons(prevLessons => prevLessons.map(lesson => lesson.id === newLesson.id ? newLesson : lesson));
  };

  useEffect(() => {
    fetchCourse();
  }, []);
  useEffect(() => {
    fetchLessons();
  }, []);

  return (
    <>
      <div className='container-fluid py-4'>
        <div className='row'>
          <div className='col-md-12 mb-lg-0 mb-4'>

            <div className='card mt-4'>
              <div className='card-header p-0 position-relative mt-n4 mx-3 z-index-2'>
                <div className='d-flex justify-content-between align-items-center bg-gradient-dark shadow-dark border-radius-lg pt-4 pb-3 px-3'>
                  <h4 className='text-white text-capitalize mb-0'>{`${course?.code} ${course?.name}`}</h4>
                  {
                    user?.role === 'Teacher' &&
                    <div className='d-flex align-items-center'>
                      <a className='text-sm me-3 cursor-pointer' style={{color: '#03a9f4'}}>
                        <i className='fas fa-edit me-2' />
                        Edit
                      </a>
                      <a className='text-sm cursor-pointer' style={{color: '#f44335'}}>
                        <i className='fas fa-trash-alt me-2' />
                        Delete
                      </a>
                    </div>
                  }
                </div>
              </div>
              <div className='card-header pb-0 p-3 mx-3 mt-2'>
                <div className='row'>

                  <ul className='list-group'>
                    {
                      lessons.map((lesson, index) => {
                        return <Lesson
                          key={index}
                          lesson={{id: lesson.id, name: lesson.name, courseId: id}}
                          onDeleteLesson={handleDeleteLesson}
                          onEditLesson={handleEditLesson}
                        />;
                      })
                    }
                  </ul>
                  {
                    user?.role === 'Teacher' &&
                    <div className='card-body p-3'>
                      <div className='row'>
                        <div className='col-12'>
                          <div
                            className='btn card bg-gradient-dark border-0 border-radius-lg d-flex align-items-center justify-content-center'
                            onClick={AddNewLesson}
                          >
                            <a className='text-white mb-0'>
                              <AddIcon />
                              Add New Lesson
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  }
                  <Divider className='m-0 my-3' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {
        isAddModalOpen &&
        <AddNewLessonModal
          isModalOpen={isAddModalOpen}
          setIsModalOpen={setIsAddModalOpen}
          courseId={id}
          fetchLessons={fetchLessons}
        />
      }
    </>
  );
};

export default CoursePage;
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { Divider } from 'antd';
import AddIcon from '@mui/icons-material/Add';
import Lesson, { LessonData } from './CourseComponents/Lesson.tsx';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ApiGetRequest } from '../../scripts/api.tsx';

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

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id');

  const fetchLessons = async () => {
    try {
      const result = await ApiGetRequest('courseLessons', {courseId: id});
      if (result.status === 200) {
        setLessons(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const fetchCourse = async () => {
    try {
      const result = await ApiGetRequest('course', {id: id});
      if (result.status === 200) {
        setCourse(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  }

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

                  <button
                    className='btn bg-gradient-warning btn-sm mb-0 shadow d-flex align-items-center justify-content-center'
                    onClick={() => console.log('Add')}
                  >
                    <AddCircleOutlineIcon className='fs-5 me-1' />
                    <span>Add</span>
                  </button>
                </div>
              </div>
              <div className='card-header pb-0 p-3 mx-3 mt-2'>
                <div className='row'>

                  <ul className='list-group'>
                    {
                      lessons.map((lesson, index) => {
                        return <Lesson key={index} name={lesson.name} id={lesson.id} />
                      })
                    }
                  </ul>

                  <div className='card-body p-3'>
                    <div className='row'>
                      <div className='col-12'>
                        <div className='card bg-gradient-dark border-0 border-radius-lg d-flex align-items-center justify-content-center'>
                          <a className='btn text-white mb-0'>
                            <AddIcon />
                            Add New Lesson
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Divider className='m-0 my-3' />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CoursePage;
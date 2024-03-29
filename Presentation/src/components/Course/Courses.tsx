import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddAltTwoToneIcon from '@mui/icons-material/PersonAddAltTwoTone';
import PersonRemoveTwoToneIcon from '@mui/icons-material/PersonRemoveTwoTone';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import MenuIcon from '@mui/icons-material/Menu';
import VpnKeyOffTwoToneIcon from '@mui/icons-material/VpnKeyOffTwoTone';
import VpnKeyTwoToneIcon from '@mui/icons-material/VpnKeyTwoTone';
import { useEffect, useState } from 'react';
import { ApiGetRequest } from '../../scripts/api.tsx';
import { Course } from './CoursePage.tsx';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/userContext.tsx';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { Tooltip } from 'antd';
import AddNewCourseModal from './AddNewCourseModal.tsx';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddNewAccessKeyModal from './CourseComponents/AddNewAccessKeyModal.tsx';
import DeleteAccessKeyModal from './CourseComponents/DeleteAccessKeyModal.tsx';
import AddTeacherModal from './CourseComponents/AddTeacherModal.tsx';
import RemoveTeacherModal from './CourseComponents/RemoveTeacherModal.tsx';

interface CourseItem extends Course {
  isMenuOpen: boolean;
}

const Courses = ({fullPage}: { fullPage: boolean }) => {
  const [ teacher, setTeacher ] = useState<any>({});
  const [ courses, setCourses ] = useState<CourseItem[]>([]);
  const [ course, setCourse ] = useState<Course | undefined>(undefined);
  const [ coursesTrigger, setCoursesTrigger ] = useState<string>('');
  const [ isAddNewCourseModalOpen, setIsAddNewCourseModalOpen ] = useState(false);
  const [ isAddAccessKeyModalOpen, setIsAddAccessKeyModalOpen ] = useState(false);
  const [ isDeleteAccessKeyModalOpen, setIsDeleteAccessKeyModalOpen ] = useState(false);
  const [ isAddTeacherModalOpen, setIsAddTeacherModalOpen ] = useState(false);
  const [ isRemoveTeacherModalOpen, setIsRemoveTeacherModalOpen ] = useState(false);
  const {user} = useUser();
  const navigate = useNavigate();
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
          course.isMenuOpen = false;
          if (course.enrolledGroups.length === 0) {
            course.enrolledGroups = 'None';
            return;
          }
          course.enrolledGroups = course.enrolledGroups.join(', ');
        });
        result.body = fullPage ? result.body : result.body.slice(0, 2);
        setCourses(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreate = () => {
    setIsAddNewCourseModalOpen(true);
  };

  const handleAddAccessKey = (course: CourseItem) => {
    setCourse(course);
    setIsAddAccessKeyModalOpen(true);
  };

  const handleDeleteAccessKey = (course: CourseItem) => {
    setCourse(course);
    setIsDeleteAccessKeyModalOpen(true);
  };

  const handleRemoveTeacher = (course: CourseItem) => {
    setCourse(course);
    setIsRemoveTeacherModalOpen(true);
  };

  const handleAddTeacher = (course: CourseItem) => {
    setCourse(course);
    setIsAddTeacherModalOpen(true);
  };

  const handleView = (course: CourseItem) => {
    navigate(`/courses/course?id=${course.id}`);
  };

  const menuOptions = [
    {
      icon: <VisibilityIcon className='fs-5 me-2' style={{color: '#6f09dc'}} />,
      title: 'View Course',
      onClick: handleView,
    },
    {
      icon: <PersonAddAltTwoToneIcon className='fs-5 me-2' style={{color: 'green'}} />,
      title: 'Add Teacher',
      onClick: handleAddTeacher,
    },
    {
      icon: <PersonRemoveTwoToneIcon className='fs-5 me-2' style={{color: 'red'}} />,
      title: 'Remove Teacher',
      onClick: handleRemoveTeacher,
    },
    {
      icon: <VpnKeyTwoToneIcon className='fs-5 me-2' style={{color: 'green'}} />,
      title: 'Add Access Key',
      onClick: handleAddAccessKey,
    },
    {
      icon: <VpnKeyOffTwoToneIcon className='fs-5 me-2' style={{color: 'red'}} />,
      title: 'Remove Access Key',
      onClick: handleDeleteAccessKey,
    },
  ];

  const listItem = (course: CourseItem) => {
    return (
      <>
        <div className='d-flex flex-column'>
          <h6 className='mb-3 text-md'>{course.code + ' ' + course.name}</h6>
          <span className='mb-2 text-sm'>Description: <span className='text-dark font-weight-bold ms-sm-2'>{course.description}</span></span>
          <span className='mb-2 text-sm'>Enrolled Groups: <span className='text-dark ms-sm-2 font-weight-bold'>{course.enrolledGroups}</span></span>
          <span className='text-sm'>Discipline: <span className='text-dark ms-sm-2 font-weight-bold'>{course.discipline}</span></span>
        </div>
        <div className='ms-auto text-end d-flex flex-column justify-content-center'>
          <div className='btn btn-link text-info text-gradient px-3 mb-0'>
            <div
              className='cursor-pointer'
              onClick={() => {
                setCourses(prevCourses => prevCourses.map(c => ({
                  ...c,
                  isMenuOpen: c.id === course.id ? !c.isMenuOpen : false,
                })));
              }}
            >
              <div className='d-flex align-items-center'>
                {
                  fullPage ?
                    (
                      course.isMenuOpen ? (
                        <>
                          <div className='d-flex flex-row'>
                            {menuOptions.map((option, index) => (
                              <Tooltip key={index} title={option.title} placement='top'>
                                <div onClick={() => option.onClick(course)}>{option.icon}</div>
                              </Tooltip>
                            ))}
                          </div>
                          <Tooltip title={`Close Menu`} placement='top'>
                            <MenuOpenIcon className='fs-4' />
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title={`Open Menu`} placement='top'>
                          <MenuIcon className='fs-4' />
                        </Tooltip>
                      )
                    )
                    :
                    <Tooltip title={`View full info about ${course.name}`} placement='left'>
                      <div onClick={() => handleView(course)}>
                        <VisibilityIcon className='fs-5' />
                      </div>
                    </Tooltip>
                }
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  useEffect(() => {
    fetchTeacher();
  }, [ user?.id ]);

  useEffect(() => {
    if (teacher.id) {
      fetchCourses();
    }
  }, [ teacher.id, coursesTrigger ]);

  return (
    <>
      <div className='container-fluid py-4'>
        <div className='row'>
          <div className='col-12 mt-4'>
            <div className='card'>
              <div className='card-header pb-0 px-3'>
                <h5 className='mb-0'>Courses Information</h5>
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
                  {
                    fullPage ?
                      <>
                        {
                          user?.role === 'Teacher' &&
                          <li
                            className='list-group-item border-1 border-dashed d-flex p-4 mb-4 border-radius-lg '
                            style={{backgroundColor: 'rgba(248,249,250,0.5)'}}
                          >
                            <div className='d-flex flex-column opacity-7'>
                              <h6 className='mb-3 text-md'>New Course</h6>
                              <span className='mb-2 text-sm'>Description: <span className='text-dark font-weight-bold ms-sm-2'>None</span></span>
                              <span className='mb-2 text-sm'>Enrolled Groups: <span className='text-dark ms-sm-2 font-weight-bold'>None</span></span>
                              <span className='text-sm'>Discipline: <span className='text-dark ms-sm-2 font-weight-bold'>None</span></span>
                            </div>
                            <div className='ms-auto text-end d-flex flex-column justify-content-center'>
                              <div className='btn btn-link text-success text-gradient px-3 mb-0'>
                                <Tooltip title='Create new course' placement='top'>
                                  <div onClick={handleCreate}>
                                    <AddBoxIcon className='fs-5 me-1' />
                                    <span>Create</span>
                                  </div>
                                </Tooltip>
                              </div>
                            </div>
                          </li>
                        }
                      </>
                      :
                      <>
                        <div className='d-flex flex-row justify-content-center'>
                          <Link to='/courses'>
                            <Tooltip title='View all courses' placement='right'>
                              <MoreHorizIcon className='fs-2 me-1' />
                            </Tooltip>
                          </Link>
                        </div>
                      </>
                  }
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        user?.role === 'Teacher' &&
        <>
          {
            isAddNewCourseModalOpen &&
            <AddNewCourseModal
              isModalOpen={isAddNewCourseModalOpen}
              setIsModalOpen={setIsAddNewCourseModalOpen}
              setCoursesTrigger={setCoursesTrigger}
            />
          }
          {
            isAddAccessKeyModalOpen &&
            <AddNewAccessKeyModal
              isModalOpen={isAddAccessKeyModalOpen}
              setIsModalOpen={setIsAddAccessKeyModalOpen}
              setCoursesTrigger={setCoursesTrigger}
              course={course!}
            />
          }
          {
            isDeleteAccessKeyModalOpen &&
            <DeleteAccessKeyModal
              isModalOpen={isDeleteAccessKeyModalOpen}
              setIsModalOpen={setIsDeleteAccessKeyModalOpen}
              setCoursesTrigger={setCoursesTrigger}
              course={course!}
            />
          }
          {
            isAddTeacherModalOpen &&
            <AddTeacherModal
              isModalOpen={isAddTeacherModalOpen}
              setIsModalOpen={setIsAddTeacherModalOpen}
              course={course!}
            />
          }
          {
            isRemoveTeacherModalOpen &&
            <RemoveTeacherModal
              isModalOpen={isRemoveTeacherModalOpen}
              setIsModalOpen={setIsRemoveTeacherModalOpen}
              course={course!}
            />
          }
        </>
      }
    </>
  );
};
export default Courses;
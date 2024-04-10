import { FC, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ApiGetRequest, ApiPostRequest } from '../../../../scripts/api.tsx';
import { LessonData } from '../LessonComponents/Lesson.tsx';
import { DatePicker, Empty, Select, TimePicker } from 'antd';
import { StudentMinimal } from '../../../../scripts/student.tsx';
import { Dayjs } from 'dayjs';
import { ToastContext } from '../../../../App.tsx';
import LoadingScreen from '../../../LoadingScreen.tsx';

interface GroupData {
  id: number;
  name: string;
}

interface AttendanceData {
  courseLessonId: number;
  date: string;
  attendanceList: { studentId: string, status: string }[];
}

interface StudentData extends StudentMinimal {
  enrolled: boolean;
  status?: string;
}

const StatusOptions = [
  {label: 'Present', value: 'Present'},
  {label: 'Absent', value: 'Absent'},
  {label: 'Late', value: 'Late'},
  {label: 'Sick', value: 'Sick'},
  {label: 'Excused', value: 'Excused'},
];

const AttendanceList: FC = () => {
  const [ lesson, setLesson ] = useState<LessonData>({name: '', id: 0, courseId: 0});
  const [ enrolledGroups, setEnrolledGroups ] = useState<GroupData[]>([]);
  const [ group, setGroup ] = useState<number | undefined>(undefined);
  const [ students, setStudents ] = useState<StudentData[]>([]);
  const [ lessonDate, setLessonDate ] = useState<Dayjs | undefined>(undefined);
  const [ lessonTime, setLessonTime ] = useState<Dayjs | undefined>(undefined);
  const [ data ] = useState<AttendanceData>({attendanceList: [], courseLessonId: 0, date: ''});
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ showAttendance, setShowAttendance ] = useState<boolean>(false);
  const setToastComponent = useContext(ToastContext);

  const navigate = useNavigate();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const lessonId = searchParams.get('lessonId') as unknown as number;
  const {courseId} = useParams();

  const fetchLesson = async () => {
    try {
      const result = await ApiGetRequest('lesson', {lessonId});
      if (result.status === 200) {
        setLesson(result.body);
      } else {
        navigate(-1);
      }
      console.log('Lesson:', result.body);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const fetchEnrolledGroups = async () => {
    try {
      const result = await ApiGetRequest('enrolledGroups', {courseId: courseId});
      if (result.status === 200) {
        console.log('Enrolled Groups:', result.body);
        setEnrolledGroups(result.body);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const result = await ApiGetRequest('getAttendance', {
        lessonId: lessonId,
        date: `${lessonDate?.format('YYYY-MM-DD')}T${lessonTime?.format('HH:mm')}`,
        groupId: group,
      });
      if (result.status === 200) {
        setStudents(result.body);
      }
    } catch (error) {
      console.log('Error:', error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async () => {
    try {
      const studentsFiltred = students.filter((student) => student.status !== undefined);
      data.attendanceList = studentsFiltred.map((student) => {
          return {studentId: student.id, status: student.status!};
        },
      );
      data.courseLessonId = lessonId;
      data.date = `${lessonDate?.format('YYYY-MM-DD')}T${lessonTime?.format('HH:mm')}`;
      console.log('Sending data:', data);

      const result = await ApiPostRequest('recordAttendance', undefined, data);
      if (result.status === 200) {
        setToastComponent({type: 'success', message: 'Attendance recorded successfully'});
      } else {
        result.body = JSON.parse(result.body);
        result.body.general = result.body.general ? result.body.general : '';
        setToastComponent({type: 'error', message: 'Failed to record attendance. ' + result.body.general});
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const handleShow = async () => {
    setShowAttendance(true);
    fetchAttendance();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    setShowAttendance(false);
  }, [ lessonDate, lessonTime, group ]);

  useEffect(() => {
    fetchLesson();
  }, []);

  useEffect(() => {
    fetchEnrolledGroups();
  }, []);

  return (
    <div className='container-fluid py-4'>
      <div className='row'>
        <div className='col-12'>
          <div className='card my-4'>
            <div className='card-header p-0 position-relative mt-n4 mx-3 z-index-2'>
              <div className='d-flex justify-content-start align-items-center bg-gradient-info shadow-info border-radius-lg pt-4 pb-3 px-3'>
                <ArrowBackIcon
                  style={{color: 'white', cursor: 'pointer', marginRight: '20px'}}
                  onClick={() => handleGoBack()}
                />
                <h4 className='text-white text-capitalize mb-0'>{`Attendance for ${lesson.name}`}</h4>
              </div>
            </div>

            <div className='card-header p-0 mx-3 mt-4 d-flex flex-column align-items-center'>
              <div className='row w-100 justify-content-center'>
                <h5 className='m-0 mb-2'>Lesson Date and Time</h5>
                <div className='col-12 d-flex mb-4'>
                  <DatePicker
                    allowClear
                    placeholder='Date of the lesson'
                    size='large'
                    onChange={(date) => {
                      setLessonDate(date);
                      console.log('Date:', date);
                    }}
                    style={{
                      width: '100%',
                      height: '50px',
                      marginRight: '5px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                  />
                  <TimePicker
                    format={'HH:mm'}
                    allowClear
                    placeholder='Time the lesson started'
                    size='large'
                    onChange={(time) => {
                      setLessonTime(time);
                      console.log('Time:', time);
                    }}
                    style={{
                      width: '100%',
                      height: '50px',
                      marginLeft: '5px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                  />
                </div>
                <h5 className='m-0 mb-2'>Select Group</h5>
                <div className='col-12 d-flex mb-4'>
                  <Select
                    className='card'
                    style={{height: '50px', fontSize: '16px', width: '100%'}}
                    size='large'
                    placeholder='Select Group'
                    allowClear
                    onChange={(value) => setGroup(value)}
                  >
                    {
                      enrolledGroups.map((group, index) => (
                        <Select.Option key={index} value={group.id}>{group.name}</Select.Option>
                      ))
                    }
                  </Select>
                </div>
                {
                  showAttendance && !isLoading &&
                  <>
                    {
                      students.length > 0 ?
                        <>
                          <h5 className='m-0 mb-2'>Record Attendance</h5>
                          <div className='col-12 d-flex mb-4'>
                            <div className='card border-1 w-100'>
                              <div className='table-responsive'>
                                <table className='table align-items-center mb-0'>
                                  <thead>
                                  <tr>
                                    <th className='text-center text-uppercase text-secondary text-xs font-weight-bolder opacity-7'>Student</th>
                                    <th
                                      className='text-center text-uppercase text-secondary text-xs font-weight-bolder opacity-7'
                                      style={{paddingInlineEnd: '42px'}}
                                    >Status
                                    </th>
                                  </tr>
                                  </thead>
                                  <tbody>
                                  {
                                    students.map((student, index) => {
                                      return (
                                        <tr key={index} style={{height: '57px'}}>
                                          <td className='align-middle text-center w-50'>
                                            <h6 className='mb-0'>{`${student.firstName} ${student.lastName}`}</h6>
                                          </td>
                                          {
                                            student.enrolled ?
                                              <td className='d-flex justify-content-center align-middle align-items-center text-center w-100'>
                                                <Select
                                                  style={{height: '40px', fontSize: '16px', width: '100%'}}
                                                  size='large'
                                                  placeholder='Status'
                                                  value={student.status !== 'Not Recorded' ? student.status : undefined}
                                                  allowClear
                                                  onChange={(value) => {
                                                    student.status = value;
                                                  }}
                                                >
                                                  {
                                                    StatusOptions.map((status, index) => (
                                                      <Select.Option
                                                        key={index}
                                                        value={status.value}
                                                      >{status.label}</Select.Option>
                                                    ))
                                                  }
                                                </Select>
                                              </td>
                                              :
                                              <td className='align-middle text-center w-50'>
                                                <h6 className='mb-0 text-danger opacity-7'>Not Enrolled</h6>
                                              </td>
                                          }
                                        </tr>
                                      );
                                    })
                                  }
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                          <button
                            className='btn bg-gradient-success text-white mt-0'
                            style={{width: 'fit-content'}}
                            onClick={handleSubmit}
                          >Submit
                          </button>
                        </>
                        :
                        <Empty className='mb-3' />
                    }
                  </>
                }
                {
                  !showAttendance &&
                  <button
                    className='btn bg-gradient-info text-white mt-0'
                    style={{width: 'fit-content'}}
                    onClick={handleShow}
                  >Show
                  </button>
                }
                {
                  isLoading &&
                  <LoadingScreen height='0' />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AttendanceList;
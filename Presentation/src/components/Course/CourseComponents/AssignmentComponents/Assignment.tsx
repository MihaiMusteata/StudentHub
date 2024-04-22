import { useLocation, useNavigate } from 'react-router-dom';
import { Document, Item } from '../LessonComponents/Lesson.tsx';
import { useContext, useEffect, useState } from 'react';
import { ApiGetRequest, ApiUploadDocument } from '../../../../scripts/api.tsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditAssignmentModal from './EditAssignmentModal.tsx';
import { useUser } from '../../../../context/userContext.tsx';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin, Upload } from 'antd';
import { ToastContext } from '../../../../App.tsx';
import { iconMap } from '../LessonComponents/LessonDocument.tsx';
import AssignmentDocument from './AssignmentDocument.tsx';
import { SubmissionsListData } from './SubmissionsList.tsx';

export interface Submission extends Item {
  documentData: Document;
  submissionDate: string;
}

export interface AssignmentData extends Item {
  lessonId: number;
  task: string;
  allowSubmission: boolean;
  dueDate: string;
  timeRemaining: string;
}

export const calculateTimeRemaining = (time: number) => {
  time = Math.abs(time);
  const days = Math.floor(time / (1000 * 60 * 60 * 24));
  const hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((time % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days} days ${hours} hours`;
  } else if (hours > 0) {
    return `${hours} hours ${minutes} minutes`;
  } else if (minutes > 0) {
    return `${minutes} minutes ${seconds} seconds`;
  } else {
    return `${seconds} seconds`;
  }
};

const Assignment = () => {
  const [ assignment, setAssignment ] = useState<AssignmentData | undefined>(undefined);
  const [ assignmentTrigger, setAssignmentTrigger ] = useState<string>('');
  const [ studentSubmissions, setStudentSubmissions ] = useState<SubmissionsListData>({
    submissions: [],
    studentName: '',
    studentId: 0,
    submissionStatus: '',
    grade: undefined,
  });
  const [ resources, setResources ] = useState<Document[]>([]);
  const [ isEditModalOpen, setIsEditModalOpen ] = useState<boolean>(false);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ documentTrigger, setDocumentTrigger ] = useState<string>('');
  const [ student, setStudent ] = useState<any>({});
  const setToastComponent = useContext(ToastContext);

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id') as unknown as number;
  const {user} = useUser();

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

  const fetchSubmissions = async () => {
    try {
      const result = await ApiGetRequest('submissions', {studentId: student?.id, lessonAssignmentId: id});
      if (result.status === 200) {
        setStudentSubmissions(result.body);
        console.log('Submissions:', result.body);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchResources = async () => {
    try {
      const result = await ApiGetRequest('lessonAssignmentResources', {lessonAssignmentId: id});
      if (result.status === 200) {
        setResources(result.body);
        console.log('Resources:', result.body);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const UploadRequest = async (file: any) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file.file as File);
    try {
      const result = user!.role === 'Student' ? await ApiUploadDocument('uploadSubmission', formData, {
          studentId: student?.id,
          lessonAssignmentId: id,
        }) :
        await ApiUploadDocument('uploadAssignmentDocument', formData, {lessonAssignmentId: id});

      if (result.status === 200) {
        user!.role === 'Student' ? await fetchSubmissions() : await fetchResources();
        setToastComponent({type: 'success', message: 'Document uploaded successfully!'});
      } else {
        result.body = JSON.parse(result.body);
        setToastComponent({type: 'error', message: 'Document upload failed! ' + result.body.general});
      }
      console.log('Result:', result);
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  const fetchAssignment = async () => {
    try {
      const response = await ApiGetRequest('lessonAssignment', {id: id});
      if (response.status === 200) {
        const result = response.body as AssignmentData;
        const timeRemaining = new Date(result.dueDate).getTime() - new Date().getTime();
        if (studentSubmissions.submissions.length === 0) {
          if (timeRemaining < 0) {
            result.timeRemaining = `Assignment is overdue by ${calculateTimeRemaining(timeRemaining)}`;
          } else {
            result.timeRemaining = calculateTimeRemaining(timeRemaining);
          }
        } else {
          const submissionDate = new Date(studentSubmissions.submissions[0].submissionDate).getTime() - new Date(result.dueDate).getTime();
          if (submissionDate < 0) {
            result.timeRemaining = `Assignment was submitted ${calculateTimeRemaining(submissionDate)} early`;
          } else {
            result.timeRemaining = `Assignment was submitted ${calculateTimeRemaining(submissionDate)} late`;
          }
        }
        result.dueDate = format(new Date(result.dueDate), 'EEEE, d MMMM yyyy, HH:mm');
        setAssignment(result);
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const editAssignment = () => {
    setIsEditModalOpen(true);
  };
  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (user!.role === 'Student') {
      fetchSubmissions();
    }
  }, [ student.id, documentTrigger ]);

  useEffect(() => {
    if (user!.role === 'Student') {
      fetchStudent();
    }
  }, []);

  useEffect(() => {
    fetchAssignment();
  }, [ assignmentTrigger, studentSubmissions.submissions.length ]);

  useEffect(() => {
    fetchResources();
  }, [ documentTrigger ]);

  const renderRow = (index: number, label: string, value: string, backgroundColor?: string) => {
    return (
      <tr key={index} style={{backgroundColor: `rgba(0,0,0,${0.05 * (index % 2)})`}}>
        <td className='fw-bold' style={{color: 'black', width: '25%'}}>{label}</td>
        <td style={{color: 'black', width: '75%', backgroundColor: backgroundColor}}>{value}</td>
      </tr>
    );
  };

  const rows = assignment ? [
    {
      label: 'Submission status',
      value: studentSubmissions.submissions.length > 0 ? 'Submitted' : 'Not submitted',
      backgroundColor: studentSubmissions.submissions.length > 0 ? 'rgba(0,255,0,0.1)' : 'rgba(0,0,0,0)',
    },
    {
      label: 'Grading status',
      value: studentSubmissions.grade ? 'Graded' : 'Not graded',
      backgroundColor: studentSubmissions.grade ? 'rgba(0,255,0,0.1)' : 'rgba(0,0,0,0)',
    },
    {
      label: 'Due date',
      value: assignment!.dueDate,
    },
    {
      label: 'Time remaining',
      value: assignment!.timeRemaining,
      backgroundColor: assignment!.timeRemaining.includes('overdue') || assignment!.timeRemaining.includes('late')
        ? 'rgba(255,0,0,0.1)'
        : studentSubmissions.submissions.length > 0 ? 'rgba(0,255,0,0.1)' : 'rgba(0,0,0,0)',
    },
    {
      label: 'Allow submission',
      value: assignment!.allowSubmission ? 'Yes' : 'No',
    },
  ] : [];
  
  const feedback = assignment ? [
    {
      label: 'Grade',
      value: studentSubmissions.grade && studentSubmissions.grade.grade ? studentSubmissions.grade.grade : 'No' +
        ' feedback',
      backgroundColor: studentSubmissions.grade ? 'rgba(0,255,0,0.1)' : 'rgba(0,0,0,0)',
    },
    {
      label: 'Graded by',
      value: studentSubmissions.grade ? studentSubmissions.grade.teacherName : 'No feedback',
    }
  ] : [];

  return (
    assignment &&
    <>
      <div className='container-fluid py-4'>
        <div className='row mb-2'>
          <div className='col-md-12 mb-lg-0 mb-4'>
            <div className='card mt-4 mb-4'>
              <div className='card-header p-0 position-relative mt-n4 mx-3 z-index-2'>
                <div className='d-flex justify-content-start align-items-center bg-gradient-dark shadow-dark border-radius-lg pt-4 pb-3 px-3'>
                  <ArrowBackIcon
                    style={{color: 'white', cursor: 'pointer', marginRight: '20px'}}
                    onClick={() => handleGoBack()}
                  />
                  <h4 className='text-white text-capitalize mb-0'>{`${assignment.name}`}</h4>
                </div>
                <h5 className='text-body font-weight-bolder my-3'>{`Task for ${assignment.name} : ${assignment.task}`}</h5>
                <div className='timeline timeline-one-side mb-3'>
                  {
                    user!.role === 'Student' && resources.map((resource, index) => (
                      <div key={index}>
                        <AssignmentDocument
                          documentId={resource.id}
                          icon={iconMap[resource.extension] || iconMap['default']}
                          extension={resource.extension}
                          title={resource.name}
                          permission={false}
                          setDocumentTrigger={setDocumentTrigger}
                        />
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-6 mb-4'>
            <div className='card h-100'>
              <div className='card-body p-3'>
                <h5 className='text-body font-weight-normal mb-4'>Submission status</h5>
                <div className='table-responsive p-0'>
                  <table className='table mb-0 color-black'>
                    <tbody>
                    {
                      rows.map((item, index) => {
                        return renderRow(index + 1, item.label, item.value, item.backgroundColor);
                      })
                    }
                    </tbody>
                  </table>

                  {
                    user?.role === 'Student' && assignment.allowSubmission &&
                    <div className='text-center'>
                      <Spin spinning={isLoading} indicator={<LoadingOutlined />}>
                        <Upload customRequest={UploadRequest} showUploadList={false} className='me-4 mb-3'>
                          <button className='btn btn-success mt-4 d-flex justify-content-center align-middle'>
                            <UploadFileIcon className='fs-5 me-1' />
                            <span>Add Submission</span>
                          </button>
                        </Upload>
                      </Spin>
                    </div>
                  }
                  {
                    user?.role === 'Teacher' &&
                    <div className='text-center d-flex justify-content-center'>

                      <button
                        className='btn btn-info mt-4'
                        onClick={editAssignment}
                      >
                        <EditIcon className='fs-5 me-1' />
                        <span>Edit</span>
                      </button>

                      <Spin spinning={isLoading} indicator={<LoadingOutlined />}>
                        <Upload customRequest={UploadRequest} showUploadList={false} className='mx-3'>
                          <button className='btn btn-success mt-4 d-flex align-middle'>
                            <UploadFileIcon className='fs-5 me-1' />
                            <span>Add Resources</span>
                          </button>
                        </Upload>
                      </Spin>

                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-6 mb-4'>
            <div className='card h-100'>
              <div className='card-body p-3'>
                <h5 className='text-body font-weight-normal mb-4'>{user!.role === 'Student'
                  ? 'Submission Files'
                  : 'Resources'}</h5>
                <div className='timeline timeline-one-side'>
                  {
                    user!.role === 'Student' && studentSubmissions.submissions.map((submission, index) => (
                      <div key={index}>
                        <AssignmentDocument
                          documentId={submission.documentData.id}
                          icon={iconMap[submission.documentData.extension] || iconMap['default']}
                          extension={submission.documentData.extension}
                          title={submission.documentData.name}
                          time={format(new Date(submission.submissionDate), 'EEEE, d MMMM yyyy, HH:mm')}
                          permission={true}
                          setDocumentTrigger={setDocumentTrigger}
                        />
                      </div>
                    ))
                  }
                  {
                    user!.role === 'Teacher' && resources.map((resource, index) => (
                      <div key={index}>
                        <AssignmentDocument
                          documentId={resource.id}
                          icon={iconMap[resource.extension] || iconMap['default']}
                          extension={resource.extension}
                          title={resource.name}
                          permission={true}
                          setDocumentTrigger={setDocumentTrigger}
                        />
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
          {
            user!.role === 'Student' &&
            <div className='col-12 mb-4'>
              <div className='card h-100'>
                <div className='card-body p-3'>
                  <h5 className='text-body font-weight-normal mb-4'>Feedback</h5>
                  <div className='table-responsive p-0'>
                    <table className='table mb-0 color-black'>
                      <tbody>
                      {
                        feedback.map((item, index) => {
                          return renderRow(index + 1, item.label, item.value?.toString(), item.backgroundColor);
                        })
                      }
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
      {
        user?.role === 'Teacher' && assignment &&
        <>
          {
            isEditModalOpen &&
            <EditAssignmentModal
              isModalOpen={isEditModalOpen}
              setIsModalOpen={setIsEditModalOpen}
              assignment={assignment}
              setAssignmentTrigger={setAssignmentTrigger}
            />
          }
        </>
      }

    </>
  );

};
export default Assignment;
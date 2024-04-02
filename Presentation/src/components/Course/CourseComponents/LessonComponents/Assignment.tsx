import { useLocation, useNavigate } from 'react-router-dom';
import { Document, Item } from './Lesson.tsx';
import { useContext, useEffect, useState } from 'react';
import { ApiDeleteRequest, ApiGetRequest, ApiUploadDocument } from '../../../../scripts/api.tsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EditAssignmentModal from './EditAssignmentModal.tsx';
import { useUser } from '../../../../context/userContext.tsx';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin, Upload } from 'antd';
import { ToastContext } from '../../../../App.tsx';
import { iconMap } from './LessonDocument.tsx';
import Tooltip from '@mui/material/Tooltip';
import ClearIcon from '@mui/icons-material/Clear';

interface Submission extends Item {
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

const calculateTimeRemaining = (time: number) => {
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
  const [ submissions, setSubmissions ] = useState<Submission[]>([]);
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
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
        setSubmissions(result.body);
        console.log('Submissions:', result.body);
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
      const result = await ApiUploadDocument('uploadSubmission', formData, {
        studentId: student?.id,
        lessonAssignmentId: id,
      });
      if (result.status === 200) {
        await fetchSubmissions();
        setToastComponent({type: 'success', message: 'Document uploaded successfully!'});
      } else {
        result.body = JSON.parse(result.body);
        setToastComponent({type: 'error', message: 'Document upload failed! ' + result.body.general});
      }
      console.log('Result:', result);
    } catch (error) {
      setIsLoading(false);
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
        if (submissions.length === 0) {
          if (timeRemaining < 0) {
            result.timeRemaining = `Assignment is overdue by ${calculateTimeRemaining(timeRemaining)}`;
          } else {
            result.timeRemaining = calculateTimeRemaining(timeRemaining);
          }
        } else {
          const submissionDate = new Date(submissions[0].submissionDate).getTime() - new Date(result.dueDate).getTime();
          if (submissionDate < 0) {
            result.timeRemaining = `Assignment was submitted ${calculateTimeRemaining(submissionDate)} early`;
          } else {
            result.timeRemaining = `Assignment was submitted ${calculateTimeRemaining(submissionDate)} late`;
          }
        }
        result.dueDate = format(new Date(result.dueDate), 'EEEE, d MMMM yyyy, HH:mm');
        setAssignment(result);
      } else {
        // navigate(-1);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteDocument = async (documetId: number) => {
    try {
      const result = await ApiDeleteRequest('deleteDocument', {documentId: documetId});
      if (result.status === 200) {
        await fetchSubmissions();
        setToastComponent({type: 'success', message: 'Document deleted successfully!'});
      } else {
        result.body = JSON.parse(result.body);
        setToastComponent({type: 'error', message: 'Document deletion failed! ' + result.body.general});
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const editAssignment = () => {
    setIsModalOpen(true);
  };
  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (user!.role === 'Student') {
      fetchSubmissions();
    }
  }, [ student.id ]);

  useEffect(() => {
    if (user!.role === 'Student') {
      fetchStudent();
    }
  }, [ user!.id ]);

  useEffect(() => {
    fetchAssignment();
  }, [ assignmentTrigger, submissions.length ]);

  const renderRow = (index: number, label: string, value: string, backgroundColor: string) => {
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
      value: submissions.length > 0 ? 'Submitted' : 'Not submitted',
      backgroundColor: submissions.length > 0 ? 'rgba(0,255,0,0.1)' : 'rgba(0,0,0,0)',
    },
    {label: 'Grading status', value: 'Not graded', backgroundColor: 'rgba(0,0,0,0)'},
    {label: 'Due date', value: assignment!.dueDate},
    {
      label: 'Time remaining',
      value: assignment!.timeRemaining,
      backgroundColor: assignment!.timeRemaining.includes('overdue') || assignment!.timeRemaining.includes('late')
        ? 'rgba(255,0,0,0.1)'
        : submissions.length > 0 ? 'rgba(0,255,0,0.1)' : 'rgba(0,0,0,0)',
    },
    {label: 'Allow submission', value: assignment!.allowSubmission ? 'Yes' : 'No'},
  ] : [];

  const listItem = ({documentId, icon, title, time}: {
    documentId: number,
    icon: JSX.Element,
    title: string,
    time: string
  }) => {
    return (
      <div className='timeline-block mb-3' key={documentId}>
        <span className='timeline-step'>
          {icon}
        </span>
        <div className='d-flex'>
          <div className='timeline-content'>
            <h6 className='text-dark text-sm font-weight-bold mb-0'>{title}</h6>
            <p className='text-secondary font-weight-bold text-xs mt-1 mb-0'>{time}</p>
          </div>
          <div className='ms-auto'>
            <Tooltip title={`Delete ${title}`} placement='top'>
              <ClearIcon
                className='cursor-pointer'
                onClick={() => deleteDocument(documentId)}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    );
  };

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
                          <button className='btn btn-primary mt-4 d-flex justify-content-center align-middle'>
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
                        className='btn btn-primary mt-4 d-flex align-middle'
                        onClick={editAssignment}
                      >
                        <EditIcon className='fs-5 me-1' />
                        <span>Edit</span>
                      </button>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
          <div className='col-lg-6 mb-4'>
            <div className='card h-100'>
              <div className='card-body p-3'>
                <div className='timeline timeline-one-side'>
                  {
                    user!.role === 'Student' &&
                    submissions.map((submission) => {
                      return listItem({
                        documentId: submission.documentData.id,
                        icon: iconMap[submission.documentData.extension] || iconMap['default'],
                        title: submission.documentData.name,
                        time: format(new Date(submission.submissionDate), 'EEEE, d MMMM yyyy, HH:mm'),
                      });
                    })
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        isModalOpen && assignment &&
        <EditAssignmentModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          assignment={assignment}
          setAssignmentTrigger={setAssignmentTrigger}
        />
      }

    </>
  );

};
export default Assignment;
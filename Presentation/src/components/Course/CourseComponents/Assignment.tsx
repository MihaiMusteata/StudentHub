import { useLocation, useNavigate } from 'react-router-dom';
import { Item } from './Lesson.tsx';
import { useEffect, useState } from 'react';
import { ApiGetRequest } from '../../../scripts/api.tsx';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { Space, Switch } from 'antd';
import { format } from 'date-fns';
import EditIcon from '@mui/icons-material/Edit';
import EditAssignmentModal from './EditAssignmentModal.tsx';

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
  const [ isModalOpen, setIsModalOpen ] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id') as unknown as number;

  const fetchAssignment = async () => {
    try {
      const response = await ApiGetRequest('lessonAssignment', {id: id});
      if (response.status === 200) {
        const result = response.body as AssignmentData;
        const timeRemaining = new Date(result.dueDate).getTime() - new Date().getTime();
        if (timeRemaining < 0) {
          result.timeRemaining = `Assignment is overdue by ${calculateTimeRemaining(timeRemaining)}`;
        } else {
          result.timeRemaining = calculateTimeRemaining(timeRemaining);
        }
        result.dueDate = format(new Date(result.dueDate), 'EEEE, d MMMM yyyy, HH:mm');
        setAssignment(result);
        console.log('Assignment:', result);
      } else {
        // navigate(-1);
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
    fetchAssignment();
    console.log("Assignment Trigger: ", assignmentTrigger)
  }, [ assignmentTrigger ]);

  const renderRow = (index: number, label: string, value: string ) => {
    return (
      <tr key={index} style={{backgroundColor: `rgba(0,0,0,${0.05 * (index % 2)})`}}>
        <td className='fw-bold ' style={{color: 'rgba(0,0,0,0.8)'}}>{label}</td>
        <td style={{color: 'rgba(0, 0, 0, 0.8)'}}>{value}</td>
      </tr>
    );
  };

  const rows = assignment ? [
    {label: 'Submission status', value: 'Status'},
    {label: 'Grading status', value: 'Status'},
    {label: 'Due date', value: assignment!.dueDate},
    {label: 'Time remaining', value: assignment!.timeRemaining},
    {label: 'Allow submission', value: assignment!.allowSubmission ? 'Yes' : 'No'},
  ] : [];

  return (
    <>
      <div className='container-fluid py-4'>
        <div className='row'>
          <div className='col-md-12 mb-lg-0 mb-4'>
            {
              assignment &&
              <div className='card mt-4'>
                <div className='card-header p-0 position-relative mt-n4 mx-3 z-index-2'>
                  <div className='d-flex justify-content-start align-items-center bg-gradient-dark shadow-dark border-radius-lg pt-4 pb-3 px-3'>
                    <ArrowBackIcon
                      style={{color: 'white', cursor: 'pointer', marginRight: '20px'}}
                      onClick={() => handleGoBack()}
                    />
                    <h4 className='text-white text-capitalize mb-0'>{`${assignment.name}`}</h4>
                  </div>
                </div>

                <div className='card-body px-6 pb-2'>
                  <h5 className='text-body font-weight-bolder my-3'>{`Task for ${assignment.name} : ${assignment.task}`}</h5>

                  <h5 className='text-body font-weight-normal mt-6 mb-4'>Submission status</h5>

                  <div className='table-responsive p-0 mb-4 border-radius-lg'>

                    <table className='table mb-0 color-black'>
                      <tbody>
                      {
                        rows.map((item, index) => {
                          return renderRow(index + 1, item.label, item.value);
                        })
                      }
                      </tbody>
                    </table>

                    <button className='btn btn-primary mt-4'>Add Submission</button>
                    <button className='btn btn-primary mt-4' onClick={editAssignment}>
                      <EditIcon className='fs-5 me-1' />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              </div>
            }
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
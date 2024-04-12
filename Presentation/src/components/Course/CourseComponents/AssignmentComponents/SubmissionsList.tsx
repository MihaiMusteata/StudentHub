import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Collapse, Empty, Popover } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ApiGetRequest } from '../../../../scripts/api.tsx';
import { AssignmentData, calculateTimeRemaining, Submission } from './Assignment.tsx';
import GradeIcon from '@mui/icons-material/Grade';
import AssignmentDocument from './AssignmentDocument.tsx';
import { iconMap } from '../LessonComponents/LessonDocument.tsx';
import { format } from 'date-fns';
import NoAccountsIcon from '@mui/icons-material/NoAccounts';
import InfoIcon from '@mui/icons-material/Info';

interface SubmissionsListData {
  studentId: number;
  studentName: string;
  submissions: Submission[];
  submissionStatus: string;
}

const StatusItem = ({description, Icon, color}: { description: string, Icon: any, color: string }) => {
  return (
    <div className='d-flex'>
      <span>{description}</span>
      <Icon className={`ms-auto text-${color}`} />
    </div>
  );
}
const statusItems = [
  { description: 'Nothing submitted', Icon: GradeIcon, color: 'secondary' },
  { description: 'Waiting for review', Icon: GradeIcon, color: 'warning' },
  { description: 'Graded', Icon: GradeIcon, color: 'success' },
  { description: 'Not enrolled', Icon: NoAccountsIcon, color: 'danger' }
];

const SubmissionsList = () => {
  const [ submissions, setSubmissions ] = useState<SubmissionsListData[]>([]);
  const [ dueDate, setDueDate ] = useState<string>('');
  const [ timeRemaining, setTimeRemaining ] = useState<number | undefined>(undefined);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const groupId = searchParams.get('groupId') as unknown as number;
  const {courseId, assignmentId} = useParams();

  const getSubmissionStatus = (submission: SubmissionsListData) => {
    if (submission.submissions.length === 0) {
      if (timeRemaining! < 0) {
        submission.submissionStatus = `Assignment is overdue by ${calculateTimeRemaining(timeRemaining!)}`;
      } else {
        submission.submissionStatus = calculateTimeRemaining(timeRemaining!);
      }
    } else {
      const submissionDate = new Date(submission.submissions[0].submissionDate).getTime() - new Date(dueDate).getTime();
      if (submissionDate < 0) {
        submission.submissionStatus = `Assignment was submitted ${calculateTimeRemaining(submissionDate)} early`;
      } else {
        submission.submissionStatus = `Assignment was submitted ${calculateTimeRemaining(submissionDate)} late`;
      }
    }
  };
  const fetchAssignment = async () => {
    try {
      const response = await ApiGetRequest('lessonAssignment', {id: assignmentId});
      if (response.status === 200) {
        const result = response.body as AssignmentData;
        setDueDate(result.dueDate);
        setTimeRemaining(new Date(result.dueDate).getTime() - new Date().getTime());
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const result = await ApiGetRequest('groupSubmissions', {
        courseId: courseId,
        groupId: groupId,
        assignmentId: assignmentId,
      });
      if (result.status === 200) {
        result.body.map((submission: SubmissionsListData) => {
          if (submission.submissions) {
            getSubmissionStatus(submission);
          }
        });
        console.log('Submissions Result Body:', result.body);
        setSubmissions(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    if (!courseId || !assignmentId || !timeRemaining) return;
    fetchSubmissions();
  }, [ courseId, assignmentId, timeRemaining ]);

  useEffect(() => {
    fetchAssignment();
  }, []);

  console.log('Rendered submissions:', submissions);
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
                <h4 className='text-white text-capitalize mb-0'>{`Submissions`}</h4>
                <Popover placement='leftTop' title={'Status Icon Meaning'} content={
                  <>
                    {
                      statusItems.map((item, index) => {
                        return (
                          <StatusItem
                            key={index}
                            description={item.description}
                            Icon={item.Icon}
                            color={item.color}
                          />
                        );
                      })
                    }
                  </>
                }
                >
                  <InfoIcon className='ms-auto cursor-pointer' style={{color: 'white'}} />
                </Popover>
              </div>
            </div>

            <div className='card-header p-0 mx-3 mt-4 d-flex flex-column align-items-center'>
              <div className='row w-100 justify-content-center'>
                {
                  submissions.length > 0 &&
                  <div className='col-12 d-flex flex-column mb-4'>
                    {
                      submissions.map((submission, index) => {
                        return (
                          <Collapse
                            key={index}
                            collapsible={submission.submissions ? 'header' : 'disabled'}
                            bordered={false}
                            expandIcon={({isActive}) =>
                              <CaretRightOutlined
                                rotate={isActive ? 90 : 0}
                                style={{paddingTop: '5px'}}
                              />}
                            style={{
                              width: '100%',
                              background: 'transparent',
                            }}
                            items={[
                              {
                                label: `${submission.studentName}`,
                                children:
                                  submission.submissions &&
                                  <>
                                    {
                                      <>
                                        <div className='table-responsive p-0'>
                                          <table className='table mb-3 color-black'>
                                            <tbody>
                                            <tr style={{backgroundColor: `rgba(0, 0, 0, 0.05)`}}>
                                              <td style={{color: 'black', width: '25%', textAlign: 'end'}}>Grade :</td>
                                              <td
                                                style={{
                                                  color: 'black',
                                                  width: '75%',
                                                  backgroundColor: 'rgba(0,0,0,0)',
                                                  fontWeight: 'lighter',
                                                }}
                                              >Value
                                              </td>
                                            </tr>
                                            <tr style={{backgroundColor: `rgba(0, 0, 0, 0)`}}>
                                              <td style={{color: 'black', width: '25%', textAlign: 'end'}}>Submission Status :</td>
                                              <td
                                                style={{
                                                  color: 'black',
                                                  width: '75%',
                                                  backgroundColor: submission.submissionStatus?.includes('early')
                                                    ? 'rgba(0,255,0,0.1)'
                                                    : 'rgba(255,0,0,0.1)',
                                                  fontWeight: 'lighter',
                                                }}
                                              >{submission.submissionStatus}
                                              </td>
                                            </tr>
                                            <tr style={{backgroundColor: `rgba(0, 0, 0, 0.05)`}}>
                                              <td style={{color: 'black', width: '25%', textAlign: 'end'}}>Submission
                                                Files :
                                              </td>
                                              <td style={{color: 'black', width: '75%', textAlign: 'end'}}></td>
                                            </tr>
                                            </tbody>
                                          </table>
                                        </div>
                                        {
                                          submission.submissions.length > 0 ?
                                            submission.submissions.map((sub, index) => {
                                              return (
                                                <div key={index}>
                                                  <div className='timeline timeline-one-side'>
                                                    <AssignmentDocument
                                                      documentId={sub.documentData.id}
                                                      icon={iconMap[sub.documentData.extension] || iconMap['default']}
                                                      extension={sub.documentData.extension}
                                                      title={sub.documentData.name}
                                                      time={format(new Date(sub.submissionDate), 'EEEE, d MMMM yyyy, HH:mm')}
                                                      permission={false}
                                                    />
                                                  </div>
                                                </div>
                                              );
                                            })
                                            :
                                            <div key={index}>
                                              <Empty
                                                className='mb-3'
                                                description={<span>No submissions yet</span>}
                                              />
                                            </div>
                                        }
                                      </>
                                    }
                                  </>,
                                style: {
                                  marginBottom: 24,
                                  borderRadius: 10,
                                  boxShadow: '0 2px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                  border: '1px solid #e9ecef',
                                  fontWeight: 'bold',
                                  fontSize: '16px',
                                },
                                extra: submission.submissions ?
                                  <GradeIcon className='text-secondary' />
                                  :
                                  <NoAccountsIcon className='text-danger' />,
                              },
                            ]}
                          />
                        );
                      })
                    }
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SubmissionsList;
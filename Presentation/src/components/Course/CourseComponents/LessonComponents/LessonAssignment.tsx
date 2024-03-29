import ClearIcon from '@mui/icons-material/Clear';
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import { FC, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Item } from './Lesson.tsx';
import Tooltip from '@mui/material/Tooltip';
import { ApiDeleteRequest } from '../../../../scripts/api.tsx';
import { ToastContext } from '../../../../App.tsx';

interface LessonTaskProps {
  assignment: Item;
  setAssignmentTrigger: (trigger: string) => void;
}

const LessonAssignment: FC<LessonTaskProps> = ({assignment,setAssignmentTrigger}) => {
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const setToastComponent = useContext(ToastContext);
  const navigate = useNavigate();
  const accessTask = () => {
    navigate(`/courses/assignment?id=${assignment.id}`);
  };
  const deleteAssignment = async () => {
    setIsLoading(true);
    try {
      const response = await ApiDeleteRequest('lessonAssignment', {id: assignment.id});
      if (response.status === 200) {
        setAssignmentTrigger(`${assignment.name} deleted on ${new Date().toDateString()}`);
        setToastComponent({type: 'success', message: 'Assignment deleted successfully'});
      } else {
        response.body = JSON.parse(response.body);
        setToastComponent({type: 'error', message: 'Failed to delete assignment. ' + response.body.general});
      }
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };
  return (
    <Spin spinning={isLoading} indicator={<></>}>
      <div className='col-12 text-dark d-flex justify-content-center align-items-center mb-3'>
        <div className='d-flex cursor-pointer' onClick={accessTask}>
          <AssignmentTwoToneIcon style={{color: '#03506F'}} />
          <h6 className='font-weight-normal m-0 ms-2 text-start'>
            {assignment.name}
          </h6>
        </div>
        {
          isLoading ? <LoadingOutlined className='ms-auto' /> :
            <>
              <div className='ms-auto'>
                <CheckBoxOutlineBlankIcon />
                {/*<CheckBoxIcon style={{color:'green'}}/>*/}

                <Tooltip title={`Delete ${assignment.name}`} placement='top'>
                  <ClearIcon
                    className='cursor-pointer'
                    onClick={deleteAssignment}
                  />
                </Tooltip>
              </div>
            </>
        }
      </div>
    </Spin>
  );
};
export default LessonAssignment;
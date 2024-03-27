import { AssignmentData } from './Assignment.tsx';
import { FC, useContext, useEffect, useState } from 'react';
import ModalForm, { FieldConfig as ModalFields } from '../../ModalForm.tsx';
import { ApiPutRequest, ApiResponse } from '../../../scripts/api.tsx';
import dayjs from 'dayjs';
import { ToastContext } from '../../../App.tsx';

interface EditAssignmentModalProps {
  assignment: AssignmentData;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  setAssignmentTrigger: (trigger: string) => void;
}

const EditAssignmentModal: FC<EditAssignmentModalProps> = ({assignment, isModalOpen, setIsModalOpen, setAssignmentTrigger}) => {
  const [ modalFields, setModalFields ] = useState<ModalFields[]>([]);
  const [ response, setResponse ] = useState<ApiResponse | undefined>(undefined);
  const setToastComponent = useContext(ToastContext);
  useEffect(() => {
    console.log('Time:', dayjs(assignment.dueDate).format('HH:mm'));
    setModalFields([
      {
        key: 'name',
        label: 'Assignment name',
        type: 'text',
        value: assignment.name,
      },
      {
        key: 'task',
        label: 'Task description',
        type: 'text',
        value: assignment.task,
      },
      {
        key: 'allowSubmission',
        label: 'Allow Submission',
        type: 'select',
        value: assignment.allowSubmission ? 'true' : 'false',
        options: [
          {label: 'Yes', value: 'true'},
          {label: 'No', value: 'false'},
        ],
      },
      {
        key: 'dueDate',
        label: 'Due Date',
        type: 'date',
        value: assignment.dueDate,
      },
      {
        key: 'dueTime',
        label: 'Due Time',
        type: 'time',
        value: dayjs(dayjs(assignment.dueDate).format('HH:mm'), 'HH:mm'),
      },
    ]);
  }, []);
  const handleSave = async (data: ModalFields[]) => {

    try {
      const assignmentData = data.map(field => {
        return {[field.key]: field.value};
      });
      const newAssignment = Object.assign({}, ...assignmentData);
      newAssignment.dueDate = new Date(`${newAssignment.dueDate}T${newAssignment.dueTime}`);
      newAssignment.allowSubmission = newAssignment.allowSubmission === 'true';
      newAssignment.lessonId = assignment.lessonId;
      newAssignment.id = assignment.id;
      console.log('Assignment:', newAssignment);
      const result = await ApiPutRequest('updateLessonAssignment', undefined, newAssignment);
      
      if (result.status === 200) {
        setToastComponent({type: 'success', message: 'Assignment Edited Successfully'});
        console.log('Time now:', new Date().getTime());
        setAssignmentTrigger(`Assignment ${newAssignment.id} edited on ${new Date().getTime()}`);
      } else {
        result.body = JSON.parse(result.body);
        result.body.general = result.body.general ? result.body.general : '';
        setToastComponent({type: 'error', message: 'Failed to edit assignment. ' + result.body.general });
      }
      setResponse(result);
    } catch (error) {
      console.log('Error:', error);
    }
  };
  console.log('Modal Fields:', modalFields);
  return (
    <>
      {
        modalFields && modalFields.length > 0 &&
        <ModalForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          fields={modalFields}
          title='Edit Assignment'
          handleSave={handleSave}
          response={response}
        />
      }
    </>
  );
};
export default EditAssignmentModal;
import { FC, useContext, useEffect, useState } from 'react';
import ModalForm, { FieldConfig as ModalFields } from '../../../ModalForm.tsx';
import { ApiPostRequest, ApiResponse } from '../../../../scripts/api.tsx';
import { ToastContext } from '../../../../App.tsx';

interface AddNewAssignmentModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  lessonId: number;
  setAssignmentTrigger: (trigger: string) => void;
}

const AddNewAssignmentModal: FC<AddNewAssignmentModalProps> = ({isModalOpen, setIsModalOpen, lessonId, setAssignmentTrigger}) => {
  const [ modalFields, setModalFields ] = useState<ModalFields[]>([]);
  const [ response, setResponse ] = useState<ApiResponse | undefined>(undefined);
  const setToastComponent = useContext(ToastContext);
  const handleSave = async (data: ModalFields[]) => {
    try {
      const assignmentData = data.map(field => {
        return {[field.key]: field.value};
      });
      const assignment = Object.assign({}, ...assignmentData);
      assignment.lessonId = lessonId;
      assignment.dueDate = new Date(`${assignment.dueDate}T${assignment.dueTime}`);
      assignment.allowSubmission = assignment.allowSubmission === 'true';

      console.log('Assignment:', assignment);
      const result = await ApiPostRequest('addLessonAssignment', undefined, assignment);

      if (result.status === 200) {
        setAssignmentTrigger(`${assignment.name} added on ${new Date().toDateString()}`);
        setToastComponent({type: 'success', message: 'Assignment added successfully'});
      } else {
        result.body = JSON.parse(result.body);
        result.body.general = result.body.general ? result.body.general : '';
        setToastComponent({type: 'error', message: 'Failed to add assignment. ' + result.body.general});
      }
      setResponse(result);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  useEffect(() => {
    setModalFields([
      {
        key: 'name',
        label: 'Assignment name',
        type: 'text',
        value: undefined,
      },
      {
        key: 'task',
        label: 'Task description',
        type: 'text',
        value: undefined,
      },
      {
        key: 'allowSubmission',
        label: 'Allow Submission',
        type: 'select',
        value: undefined,
        options: [
          {label: 'Yes', value: 'true'},
          {label: 'No', value: 'false'},
        ],
      },
      {
        key: 'dueDate',
        label: 'Due Date',
        type: 'date',
        value: undefined,
      },
      {
        key: 'dueTime',
        label: 'Due Time',
        type: 'time',
        value: undefined,
      },
    ]);
  }, []);
  return (
    <>
      {
        modalFields && modalFields.length > 0 &&
        <ModalForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          fields={modalFields}
          title='Add New Assignment'
          handleSave={handleSave}
          response={response}
        />
      }
    </>
  );
};
export default AddNewAssignmentModal;
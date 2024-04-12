import { FC, useEffect, useState } from 'react';
import { ApiGetRequest, ApiResponse } from '../../../../scripts/api.tsx';
import ModalForm, { FieldConfig as ModalFields } from '../../../ModalForm.tsx';
import { useNavigate } from 'react-router-dom';
import { GroupData } from '../AttendanceComponents/AttendanceList.tsx';

interface AccessSubmissionModalProps {
  lessonAssignmentId: number;
  courseId: number;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
}

const AccessSubmissionModal: FC<AccessSubmissionModalProps> = ({isModalOpen, setIsModalOpen, courseId, lessonAssignmentId}) => {
  const [ response ] = useState<ApiResponse | undefined>(undefined);
  const [ modalFields, setModalFields ] = useState<ModalFields[]>([]);
  const [ enrolledGroups, setEnrolledGroups ] = useState<GroupData[]>([]);
  const navigate = useNavigate();

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

  const handleSave = (data: ModalFields[]) => {
    navigate(`/courses/course/${courseId}/assignment/${lessonAssignmentId}/submissions?groupId=${data[0].value}`);
  };

  useEffect(() => {
    fetchEnrolledGroups();
  }, []);

  useEffect(() => {
    setModalFields([
        {
          key: 'groupId',
          label: 'Select Group',
          type: 'select',
          value: undefined,
          options: enrolledGroups.map(group => {
            return {value: group.id, label: group.name};
          }),
        },
      ],
    );
  }, [ enrolledGroups ]);

  return (
    <ModalForm
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      fields={modalFields}
      title={'Access Submissions'}
      handleSave={handleSave}
      response={response}
    />
  );
};
export default AccessSubmissionModal;
import { FC, useContext, useEffect, useState } from 'react';
import { ApiPostRequest, ApiResponse } from '../../../scripts/api.tsx';
import { useNavigate } from 'react-router-dom';
import ModalForm, { FieldConfig as ModalFields } from '../../ModalForm.tsx';
import { ToastContext } from '../../../App.tsx';
import { EnrollData } from '../SearchedCourses.tsx';

interface EnterAccessKeyModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  enrollData: EnrollData;
}

const EnterAccessKeyModal: FC<EnterAccessKeyModalProps> = ({isModalOpen, setIsModalOpen, enrollData}) => {
  const [ response, setResponse] = useState<ApiResponse | undefined>(undefined);
  const [ modalFields, setModalFields ] = useState<ModalFields[]>([]);
  const navigate = useNavigate();
  const setToastComponent = useContext(ToastContext);
  const handleSave = async (data: ModalFields[]) => {
    try {
      enrollData.accessKey = String(data[0].value);
      console.log('Enroll Data:', enrollData);
      const result = await ApiPostRequest('enrollStudent', undefined, enrollData);
      console.log('Result:', result);
      if (result.status === 200) {
        setToastComponent({type: 'success', message: 'Successfully enrolled!'});
        navigate(`/courses/course?id=${enrollData.courseId}`);
      } else {
        result.body = JSON.parse(result.body);
        result.body.general = result.body.general ? result.body.general : '';
        setToastComponent({type: 'error', message: 'Failed to enroll. ' + result.body.general});
      }
      setResponse(result );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    setModalFields([
        {
          key: 'accessKey',
          label: 'Access Key',
          type: 'text',
          value: undefined,
        },
      ],
    );
  }, []);

  return (
    <ModalForm
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      fields={modalFields}
      title={'Enter Access Key'}
      handleSave={handleSave}
      response={response}
    />
  );
};

export default EnterAccessKeyModal;
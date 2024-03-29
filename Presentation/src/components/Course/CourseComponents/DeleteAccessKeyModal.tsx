import { FC, useContext, useEffect, useState } from 'react';
import ModalForm, { FieldConfig as ModalFields } from '../../ModalForm.tsx';
import { ApiDeleteRequest, ApiGetRequest, ApiResponse } from '../../../scripts/api.tsx';
import { ToastContext } from '../../../App.tsx';
import { Course } from '../CoursePage.tsx';

interface DeleteAccessKeyModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  course: Course;
  setCoursesTrigger: (trigger: string) => void;
}

interface Key {
  id: string;
  accessKey: string;
  groupName: string;
}

const DeleteAccessKeyModal: FC<DeleteAccessKeyModalProps> = ({isModalOpen, setIsModalOpen, course, setCoursesTrigger}) => {
  const [ modalFields, setModalFields ] = useState<ModalFields[]>([]);
  const [ response, setResponse ] = useState<ApiResponse | undefined>(undefined);
  const [ keys, setKeys ] = useState<Key[]>([]);
  const setToastComponent = useContext(ToastContext);
  
  const handleSave = async (data: ModalFields[]) => {
    try {
      const key = {
        accessKeys: data[0].value,
      }
      console.log("Key:", key);
      const result = await ApiDeleteRequest('deleteAccessKeys', undefined, key);
      console.log("Result:", result);
      if (result.status === 200) {
        setCoursesTrigger(`Access key deleted at ${new Date().toLocaleTimeString()}`);
        setToastComponent({type: 'success', message: 'Access Key Deleted Successfully'});
      } else {
        result.body = JSON.parse(result.body);
        result.body.general = result.body.general ? result.body.general : '';
        setToastComponent({type: 'error', message: 'Failed to delete access key. ' + result.body.general});
      }
      setResponse(result);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const fetchKeys = async () => {
    try {
      const result = await ApiGetRequest('accessKeys', {courseId: course.id});
      if (result.status === 200) {
        setKeys(result.body);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  useEffect(() => {
    setModalFields([
      {
        key: 'key',
        label: 'Key',
        type: 'multiple-select',
        value: undefined,
        options: keys.map(key => {
          return {value: key.id, label: `${key.groupName} - ${key.accessKey}`};
        }),
      },
    ]);
  }, [ keys ]);

  return (
    <ModalForm
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      fields={modalFields}
      title='Delete Access Key'
      handleSave={handleSave}
      response={response}
    >
    </ModalForm>
  );
};
export default DeleteAccessKeyModal;
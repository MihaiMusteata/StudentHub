import { FC, useContext, useEffect, useState } from 'react';
import ModalForm, { FieldConfig as ModalFields } from '../../ModalForm';
import { ApiGetRequest, ApiPostRequest, ApiResponse } from '../../../scripts/api.tsx';
import { ToastContext } from '../../../App.tsx';
import { Course } from '../CoursePage.tsx';

interface AddNewAccessKeyModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  course: Course;
}

interface Group {
  id: string;
  name: string;
}

const AddNewAccessKeyModal: FC<AddNewAccessKeyModalProps> = ({isModalOpen, setIsModalOpen, course}) => {
  const [ modalFields, setModalFields ] = useState<ModalFields[]>([]);
  const [ response, setResponse ] = useState<ApiResponse | undefined>(undefined);
  const [ groups, setGroups ] = useState<Group[]>([]);
  const setToastComponent = useContext(ToastContext);
  
  const handleSave = async (data: ModalFields[]) => {
    try {
      const accessKeyData = data.map(field => {
        return {[field.key]: field.value};
      });
      const accessKey = Object.assign({}, ...accessKeyData);
      accessKey.courseId = course.id;
      console.log("Access Key:", accessKey);
      const result = await ApiPostRequest('addAccessKey', undefined, accessKey);
      
      if (result.status === 200) {
        setToastComponent({type: 'success', message: 'Access Key Added Successfully'});
      } else {
        result.body = JSON.parse(result.body);
        result.body.general = result.body.general ? result.body.general : '';
        setToastComponent({type: 'error', message: 'Failed to add access key. ' + result.body.general});
      }
      setResponse(result);
    } catch (error) {
      console.log('Error:', error);
    }
  }
  const fetchGroups = async () => {
    try {
      const result = await ApiGetRequest('groups');
      if (result.status === 200) {
        setGroups(result.body);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    console.log('Groups:', groups);
    setModalFields([
      {
        key: 'groupsIds',
        label: 'Groups',
        type: 'multiple-select',
        value: undefined,
        options: groups.map(group => {
          return {label: group.name, value: group.id};
        }),
      },
      {
        key: 'accessKey',
        label: 'Access Key',
        type: 'text',
        value: undefined,
      },
    ]);
  }, [groups]);
  
  return (
    <>
      {
        modalFields && modalFields.length > 0 &&
        <ModalForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          fields={modalFields}
          title={`Create new access key for ${course.name}`}
          handleSave={handleSave}
          response={response}
        />
      }
    </>
  );
};
export default AddNewAccessKeyModal;
  
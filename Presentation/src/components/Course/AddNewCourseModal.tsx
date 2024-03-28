import { FC, useContext, useEffect, useState } from 'react';
import ModalForm, { FieldConfig as ModalFields } from '../ModalForm.tsx';
import { ApiGetRequest, ApiPostRequest, ApiResponse } from '../../scripts/api.tsx';
import { ToastContext } from '../../App.tsx';
import { useUser } from '../../context/userContext.tsx';

interface AddNewCourseModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  setCoursesTrigger: (coursesTrigger: string) => void;
}

interface Discipline {
  id: string;
  name: string;
}

const AddNewCourseModal: FC<AddNewCourseModalProps> = ({isModalOpen, setIsModalOpen, setCoursesTrigger}) => {
  const [ modalFields, setModalFields ] = useState<ModalFields[]>([]);
  const [ response, setResponse ] = useState<ApiResponse | undefined>(undefined);
  const [ disciplines, setDisciplines ] = useState<Discipline[]>([]);
  const setToastComponent = useContext(ToastContext);
  const {user} = useUser();
  const handleSave = async (data: ModalFields[]) => {
    try {
      const courseData = data.map(field => {
        return {[field.key]: field.value};
      });
      
      const course = Object.assign({}, ...courseData);
      course.userId = user!.id;
      
      console.log("Sending course:", course);
      const result = await ApiPostRequest('course', undefined, course);
      if (result.status === 200) {
        setCoursesTrigger(`New course added at ${new Date().toLocaleTimeString()}`);
        setToastComponent({type: 'success', message: 'Course added successfully'});
      } else {
        result.body = JSON.parse(result.body);
        result.body.general = result.body.general ? result.body.general : '';
        setToastComponent({type: 'error', message: 'Failed to add course. ' + result.body.general});
      }
      setResponse(result);
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const fetchDisciplines = async () => {
    try {
      const result = await ApiGetRequest('disciplines');
      if (result.status === 200) {
        setDisciplines(result.body);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  useEffect(() => {
    fetchDisciplines();
  }, []);

  useEffect(() => {
    setModalFields([
      {
        key: 'code',
        label: 'Course code',
        type: 'text',
        value: undefined,
      },
      {
        key: 'name',
        label: 'Course name',
        type: 'text',
        value: undefined,
      },
      {
        key: 'description',
        label: 'Course description',
        type: 'text',
        value: undefined,
      },
      {
        key: 'disciplineId',
        label: 'Course discipline',
        type: 'select',
        value: undefined,
        options: disciplines.map(discipline => {
          return {value: discipline.id, label: discipline.name};
        }),
      },
    ]);
  }, [ disciplines ]);

  return (
    <>
      {
        modalFields && modalFields.length > 0 &&
        <ModalForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          fields={modalFields}
          title='Add New Course'
          handleSave={handleSave}
          response={response}
        />
      }
    </>
  );
};
export default AddNewCourseModal;
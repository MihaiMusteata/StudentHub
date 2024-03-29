import { Course } from '../CoursePage.tsx';
import ModalForm, { FieldConfig as ModalFields } from '../../ModalForm.tsx';
import { FC, useContext, useEffect, useState } from 'react';
import { ApiGetRequest, ApiPostRequest, ApiResponse } from '../../../scripts/api.tsx';
import { ToastContext } from '../../../App.tsx';

interface AddTeacherModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  course: Course;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

const AddTeacherModal: FC<AddTeacherModalProps> = ({isModalOpen, setIsModalOpen, course}) => {
  const [ modalFields, setModalFields ] = useState<ModalFields[]>([]);
  const [ response, setResponse ] = useState<ApiResponse | undefined>(undefined);
  const [ teachers, setTeachers ] = useState<Teacher[]>([]);
  const setToastComponent = useContext(ToastContext);
  
  const handleSave = async (data: ModalFields[]) => {
    try {
      const teacherData = data.map(field => {
        return {[field.key]: field.value};
      });
      const teacher = Object.assign({}, ...teacherData);
      console.log("Teacher:", teacher);
      const result = await ApiPostRequest('assignTeacherToCourse', {courseId: course.id, teacherId: teacher.teacherId});
      
      if (result.status === 200) {
        setToastComponent({type: 'success', message: 'Teacher Added Successfully'});
      } else {
        result.body = JSON.parse(result.body);
        result.body.general = result.body.general ? result.body.general : '';
        setToastComponent({type: 'error', message: 'Failed to add teacher. ' + result.body.general});
      }
      setResponse(result);
    } catch (error) {
      console.log('Error:', error);
    }
  }
  
  const fetchTeachers = async () => {
    try {
      const result = await ApiGetRequest('availableTeachers', {courseId: course.id});
      if (result.status === 200) {
        setTeachers(result.body);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    setModalFields([
      {
        key: 'teacherId',
        type: 'select',
        label: 'Teacher',
        value: undefined,
        options: teachers.map(teacher => {
          return {value: teacher.id, label: `${teacher.firstName} ${teacher.lastName}`};
        }),
      },
    ]);
  }, [ teachers ]);

  return (
    <ModalForm
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      title={`Add teacher to ${course.name}`}
      fields={modalFields}
      response={response}
      handleSave={handleSave}
    />
  );
};
export default AddTeacherModal;
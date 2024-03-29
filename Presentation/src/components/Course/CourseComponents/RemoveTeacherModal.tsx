import ModalForm, { FieldConfig as ModalFields } from '../../ModalForm.tsx';
import { FC, useContext, useEffect } from 'react';
import { useState } from 'react';
import { Course } from '../CoursePage.tsx';
import { ApiDeleteRequest, ApiGetRequest, ApiPostRequest, ApiResponse } from '../../../scripts/api.tsx';
import { ToastContext } from '../../../App.tsx';

interface RemoveTeacherModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  course: Course;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

const RemoveTeacherModal: FC<RemoveTeacherModalProps> = ({isModalOpen, setIsModalOpen, course}) => {
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
      const result = await ApiDeleteRequest('removeTeacherFromCourse', {courseId: course.id, teacherId: teacher.teacherId});
      
      if (result.status === 200) {
        setToastComponent({type: 'success', message: 'Teacher Removed Successfully'});
      } else {
        result.body = JSON.parse(result.body);
        result.body.general = result.body.general ? result.body.general : '';
        setToastComponent({type: 'error', message: 'Failed to remove teacher. ' + result.body.general});
      }
      setResponse(result);
    } catch (error) {
      console.log('Error:', error);
    }
  }
  
  const fetchTeachers = async () => {
    try {
      const result = await ApiGetRequest('courseTeachers', {courseId: course.id});
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
        label: 'Teacher',
        type: 'select',
        value: undefined,
        options: teachers.map(teacher => {
          return {label: teacher.firstName + ' ' + teacher.lastName, value: teacher.id};
        }),
      },
    ]);
  }, [ teachers ]);

  return (
    <ModalForm
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      title='Remove Teacher'
      fields={modalFields}
      response={response}
      handleSave={handleSave}
    />
  );
};
export default RemoveTeacherModal;
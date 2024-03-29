import { FC, useContext, useEffect, useState } from 'react';
import ModalForm, { FieldConfig as ModalFields } from '../../../ModalForm.tsx';
import { ApiPostRequest, ApiResponse } from '../../../../scripts/api.tsx';
import { ToastContext } from '../../../../App.tsx';

interface AddNewLessonProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  courseId: number;
  fetchLessons: () => void;
}

const AddNewLessonModal: FC<AddNewLessonProps> = ({isModalOpen, setIsModalOpen, courseId, fetchLessons}) => {
  const [ modalFields, setModalFields ] = useState<ModalFields[]>([]);
  const [ response, setResponse ] = useState<ApiResponse | undefined>(undefined);
  const setToastComponent = useContext(ToastContext);

  const handleSave = async (data: ModalFields[]) => {
    try {
      const lessonData = data.map(field => {
        return {[field.key]: field.value};
      });
      const lesson = Object.assign({}, ...lessonData);
      lesson.courseId = courseId;

      const result = await ApiPostRequest('addLesson', undefined, lesson);

      if (result.status === 200) {
        setToastComponent({type: 'success', message: 'Lesson Added Successfully'});
        fetchLessons();
      } else {
        result.body = JSON.parse(result.body);
        result.body.general = result.body.general ? result.body.general : '';
        setToastComponent({type: 'error', message: 'Failed to add lesson.' + result.body.general});
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
        label: 'Lesson Name',
        type: 'text',
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
          title='Add New Lesson'
          handleSave={handleSave}
          response={response}
        />
      }
    </>
  );
};
export default AddNewLessonModal;
import { FC, useContext, useEffect, useState } from 'react';
import ModalForm, { FieldConfig as ModalFields } from '../../../ModalForm.tsx';
import { ApiPutRequest, ApiResponse } from '../../../../scripts/api.tsx';
import { LessonData } from './Lesson.tsx';
import { ToastContext } from '../../../../App.tsx';

interface EditLessonModalProps {
  lesson: LessonData;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
  onEditLesson: (lesson: LessonData) => void;
}

const EditLessonModal: FC<EditLessonModalProps> = ({lesson, isModalOpen, setIsModalOpen, onEditLesson}) => {
  const [ modalFields, setModalFields ] = useState<ModalFields[]>([]);
  const [ response, setResponse ] = useState<ApiResponse>({status: 0, body: {}});
  const setToastComponent = useContext(ToastContext);
  const handleSave = async (data: ModalFields[]) => {
    try {
      const lessonData = data.map(field => {
        return {[field.key]: field.value};
      });
      const updatedLesson = Object.assign({}, ...lessonData);

      updatedLesson.courseId = lesson.courseId;
      updatedLesson.id = lesson.id;
      console.log(updatedLesson)
      const result = await ApiPutRequest('updateLesson', undefined, updatedLesson);

      if (result.status === 200) {
        setToastComponent({type: 'success', message: 'Lesson updated successfully.'});
        onEditLesson(updatedLesson);
      } else {
        result.body = JSON.parse(result.body);
        result.body.general = result.body.general ? result.body.general : '';
        setToastComponent({type: 'error', message: 'Failed to update lesson.' + result.body.general });
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
          value: lesson.name,
        },
      ],
    );
  }, []);
  return (
    <>
      {
        modalFields && modalFields.length > 0 &&
        <ModalForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          fields={modalFields}
          title='Rename Lesson'
          handleSave={handleSave}
          response={response}
        />
      }
    </>
  );
};
export default EditLessonModal;
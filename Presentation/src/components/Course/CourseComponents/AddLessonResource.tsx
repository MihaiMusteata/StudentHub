import { FC, useEffect, useState } from 'react';
import ModalForm, { FieldConfig as ModalFields } from '../../ModalForm.tsx';

interface AddLessonResourceProps {
  handleSave: (data: ModalFields[]) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
}

const AddLessonResource: FC<AddLessonResourceProps> = ({handleSave, isModalOpen, setIsModalOpen}) => {
  const [ modalFields, setModalFields ] = useState<ModalFields[]>([]);
  useEffect(() => {
    setModalFields([
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        value: undefined,
        options: [
          {value: 'document', label: 'Document'},
          {value: 'task', label: 'Task'},
        ],
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
          title='Add New Item'
          handleSave={handleSave}
        />
      }
    </>
  );
};
export default AddLessonResource;
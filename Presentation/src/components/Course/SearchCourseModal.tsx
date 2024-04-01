import { FC, useEffect, useState } from 'react';
import ModalForm, { FieldConfig as ModalFields } from '../ModalForm.tsx';
import { ApiResponse } from '../../scripts/api.tsx';
import { useNavigate } from 'react-router-dom';

interface SearchCourseModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
}

const SearchCourseModal: FC<SearchCourseModalProps> = ({isModalOpen, setIsModalOpen}) => {
  const [ response ] = useState<ApiResponse | undefined>(undefined);
  const [ modalFields, setModalFields ] = useState<ModalFields[]>([]);
  const navigate = useNavigate();
  const handleSave = (data: ModalFields[]) => {
    navigate('/courses/search?course=' + data[0].value);
  };

  useEffect(() => {
    setModalFields([
        {
          key: 'search',
          label: 'Search',
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
      title={'Search Course'}
      handleSave={handleSave}
      response={response}
    />
  );
};
export default SearchCourseModal;
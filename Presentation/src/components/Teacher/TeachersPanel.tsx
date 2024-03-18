import { useContext, useEffect, useState } from 'react';
import { Teacher } from '../../scripts/teacher';
import { ToastContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { ApiDeleteRequest, ApiGetRequest } from '../../scripts/api';
import Panel from '../Panel';
import { format } from 'date-fns';
import AddTeacherModal from './AddTeacherModal';

const TeachersPanel = () => {
  const [ universities, setUniversities ] = useState<any>();
  const [ teachers, setTeachers ] = useState<Teacher[]>([]);
  const [ isAddModalOpen, setIsAddModalOpen ] = useState(false);
  const setToastComponent = useContext(ToastContext);
  const navigate = useNavigate();

  const fetchField = async (field: string) => {
    const response = await ApiGetRequest(field);

    if (response.status === 200) {
      return response.body;
    }
    return [];
  };

  useEffect(() => {
    const fetchFields = async () => {
      const universities = await fetchField('universities');
      setUniversities(universities);
    };
    fetchFields();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await ApiGetRequest('teachers');
      if (response.status === 200) {
        const teachers = response.body as Teacher[];
        setTeachers(teachers);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      const response = await ApiDeleteRequest('deleteTeacher', {teacherId: id});

      if (response.status === 200) {
        setToastComponent({type: 'success', message: 'Teacher Deleted Successfully'});
        setTeachers(teachers.filter(teacher => teacher.id != id));
      } else {
        response.body = JSON.parse(response.body);
        setToastComponent({type: 'error', message: 'Failed to delete teacher.\n' + response.body.general});
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const handleInfo = (id: string): void => {
    navigate('/teachers/teacher?id=' + id);
  };

  useEffect(() => {
    fetchTeachers();
  }, [ teachers.length ]);

  return (
    <>
      <Panel
        setIsAddModalOpen={setIsAddModalOpen}
        columns={[ 'ID', 'First Name', 'Last Name', 'Birth Date', 'University' ]}
        data={teachers.map(teacher => ({
          id: teacher.id,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          birthDate: format(new Date(teacher.birthDate), 'yyyy-MM-dd'),
          university: universities.find((university: any) => university.id === teacher.universityId)?.name
        }))}
        title='Teachers Table'
        onDelete={handleDelete}
        onInfo={handleInfo}
      />
      {
        isAddModalOpen &&
        <AddTeacherModal setIsModalOpen={setIsAddModalOpen} isModalOpen={isAddModalOpen} />
      }
    </>
  );
};
export default TeachersPanel;
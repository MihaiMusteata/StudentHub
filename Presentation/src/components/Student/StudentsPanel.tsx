import { FC, useContext, useEffect, useState } from 'react';
import Panel from '../Panel';
import { ApiGetRequest, ApiDeleteRequest } from '../../scripts/api';
import { format } from 'date-fns';
import { Student } from '../../scripts/student';
import { useNavigate } from 'react-router-dom';
import AddStudentModal from './AddStudentModal';
import { ToastContext } from '../../App';

interface UniversityFields {
  universities: any[];
  faculties: any[];
}


const StudentsPanel: FC = () => {
  const [universitiesField, setUniversities] = useState<UniversityFields>({ universities: [], faculties: [] });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const setToastComponent = useContext(ToastContext);
  const navigate = useNavigate();

  const fetchField = async (field: string) => {
    const response = await ApiGetRequest(field);

    if (response.status === 200) {
      return response.body;
    }
    return [];
  };

  const fetchFields = async () => {
    try {
      const [univs, facs] = await Promise.all([
        fetchField('universities'),
        fetchField('faculties')
      ]);
      setUniversities({ universities: univs, faculties: facs });

    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await ApiGetRequest('students');
      if (response.status === 200) {
        const students = response.body as Student[];
        setStudents(students);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };


  const handleDelete = async (id: string): Promise<void> => {
    try {
      const response = await ApiDeleteRequest('deleteStudent', { studentId: id });

      if (response.status === 200) {
        setToastComponent({ type: 'success', message: 'Student Deleted' });
        setStudents(students.filter(student => student.id != id));
      }
      else {
        response.body = JSON.parse(response.body);
        setToastComponent({ type: 'error', message: 'Failed to delete student. ' + response.body.general });
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const handleInfo = (id: string): void => {
    navigate('/students/student?id=' + id);
  }

  useEffect(() => {
    fetchFields();
  }, [universitiesField.universities.length, universitiesField.faculties.length]);

  useEffect(() => {
    fetchStudents();
  }, [students.length]);

  return (
    <>
      <Panel
        setIsAddModalOpen={setIsAddModalOpen}
        columns={['ID', 'First Name', 'Last Name', 'Year', 'Faculty', 'University', 'Enrollment', 'Graduation']}
        data={students.map(student => ({
          id: String(student.id),
          FirstName: student.firstName,
          LastName: student.lastName,
          Year: student.year,
          Faculty: universitiesField.faculties.find(faculty => faculty.id === student.facultyId)?.name,
          University: universitiesField.universities.find(university => university.id === student.universityId)?.name,
          EnrollmentDate: format(new Date(student.enrollmentDate), 'yyyy-MM-dd'),
          GraduationDate: format(new Date(student.graduationDate), 'yyyy-MM-dd')
        }))}
        title="Students Table"
        onDelete={handleDelete}
        onInfo={handleInfo}
      />
      {
        isAddModalOpen &&
        <AddStudentModal isModalOpen={isAddModalOpen} setIsModalOpen={setIsAddModalOpen} />
      }
    </>
  );
};

export default StudentsPanel;

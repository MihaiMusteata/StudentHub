import ModalForm from "../ModalForm";
import { FC, useContext, useEffect, useState } from 'react';
import { ApiResponse, ApiGetRequest } from '../../scripts/api';
import { useNavigate } from 'react-router-dom';
import { User } from "../../scripts/user";
import { Student } from "../../scripts/student";
import { FieldConfig as ModalFields } from "../ModalForm";
import { ToastContext } from "../../App";

interface AddStudentModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isModalOpen: boolean) => void;
}

const AddStudentModal: FC<AddStudentModalProps> = ({ isModalOpen, setIsModalOpen }) => {
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filtredUsers, setFiltredUsers] = useState<User[]>([]);
  const [modalFields, setModalFields] = useState<ModalFields[]>([]);
  const [response] = useState<ApiResponse | undefined>(undefined)
  const setToastComponent = useContext(ToastContext);

  const handleSave = async (data: ModalFields[]) => {
    const userData = data.map(field => {
      return { [field.key]: field.value };
    });
    const user = Object.assign({}, ...userData);
    setToastComponent({ type: 'info', message: 'Complete the student details' });
    setSelectedUserId(user.userId);
    console.log('Selected User ID:', user.userId);
  }

  const fetchUsers = async () => {
    try {
      const result = await ApiGetRequest('users');
      const response = result as ApiResponse;
      if (response.status === 200) {
        const fetchedUsers = response.body as User[];
        setUsers(fetchedUsers);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const result = await ApiGetRequest('students');
      const response = result as ApiResponse;
      if (response.status === 200) {
        const fetchedStudents = response.body as Student[];
        setStudents(fetchedStudents);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length === 0) {
      setFiltredUsers(users.filter(user => user.role === "Student"));
    }
    setFiltredUsers(users.filter(user => !students.find(student => student.userId === user.id) && user.role === "Student"));
  }, [users, students]);

  useEffect(() => {
    setModalFields([
      {
        key: "userId",
        label: "User ID",
        type: "select",
        value: undefined,
        options: filtredUsers.map(user => {
          return { value: user.id, label: (user.id + ' | ' + user.firstName + ' ' + user.lastName) };
        })
      }
    ]);
  }, [filtredUsers]);
  
  return (
    <>
      {
        modalFields && modalFields.length > 0 &&
        <ModalForm isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} fields={modalFields} title="Add New Student" handleSave={handleSave} response={response} />
      }
      {
        selectedUserId &&
        (
          console.log("Selected User ID:", selectedUserId),
          navigate(`/students/student?userId=${selectedUserId}`)
        )
      }
    </>
  )
}

export default AddStudentModal;
import { useNavigate } from "react-router-dom";
import { Teacher } from "../../scripts/teacher";
import ModalForm from "../ModalForm";
import { FC, useContext, useEffect, useState } from "react";
import { User } from "../../scripts/user";
import { FieldConfig as ModalFields } from "../ModalForm";
import { ApiGetRequest, ApiResponse } from "../../scripts/api";
import { ToastContext } from "../../App";

interface AddTeacherModalProps {
    isModalOpen: boolean;
    setIsModalOpen: (isModalOpen: boolean) => void;
}

const AddTeacherModal: FC<AddTeacherModalProps> = ({ isModalOpen, setIsModalOpen }) => {
    const navigate = useNavigate();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [filtredUsers, setFiltredUsers] = useState<User[]>([]);
    const [modalFields, setModalFields] = useState<ModalFields[]>([]);
    const [response] = useState<ApiResponse | undefined>(undefined)
    const setToastComponent = useContext(ToastContext);

    const handleSave = async (data: ModalFields[]) => {
        const userData = data.map(field => {
            return { [field.key]: field.value };
        });
        const user = Object.assign({}, ...userData);
        setToastComponent({ type: 'info', message: 'Complete the teacher details' });
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
    }

    const fetchTeachers = async () => {
        try {
            const result = await ApiGetRequest('teachers');
            const response = result as ApiResponse;
            if (response.status === 200) {
                const fetchedTeachers = response.body as Teacher[];
                setTeachers(fetchedTeachers);
            }
        } catch (error) {
            console.log('Error:', error);
        }
    }

    useEffect(() => {
        fetchUsers();
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (teachers.length === 0) {
            setFiltredUsers(users.filter(user => user.role === "Teacher"));
        }
        setFiltredUsers(users.filter(user => !teachers.find(teacher => teacher.userId === user.id) && user.role === "Teacher"));
    }, [users, teachers]);

    useEffect(() => {
        setModalFields([
            {
                key: "userId",
                label: "User",
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
                <ModalForm
                    isModalOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                    fields={modalFields}
                    title="Add Teacher"
                    handleSave={handleSave}
                    response={response}
                />
            }
            {
                selectedUserId &&
                (
                    console.log('Selected User ID:', selectedUserId),
                    navigate(`/teachers/teacher?userId=${selectedUserId}`)
                )
            }
        </>
    );
}

export default AddTeacherModal;
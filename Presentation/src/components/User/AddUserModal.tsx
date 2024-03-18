import ModalForm from '../ModalForm';
import { ApiResponse, ApiPostRequest } from '../../scripts/api';
import { format } from 'date-fns';
import { FC, useEffect, useState } from 'react';
import { User } from '../../scripts/user';
import { toastProps } from '../../App';
import { FieldConfig as ModalFields } from '../ModalForm';

interface AddUserModalProps {
    users: User[];
    isModalOpen: boolean;
    setIsModalOpen: (isModalOpen: boolean) => void;
    setUsers: (users: User[]) => void;
    setToastComponent: (toastComponent: toastProps) => void;
}

const AddUserModal: FC<AddUserModalProps> = ({ users, isModalOpen, setIsModalOpen, setUsers, setToastComponent }) => {
    const [modalFields, setModalFields] = useState<ModalFields[]>([]);
    const [response, setResponse] = useState<ApiResponse | undefined>(undefined);

    const handleSave = async (data: ModalFields[]) => {
        try {
            const userData = data.map(field => {
                return { [field.key]: field.value };
            });
            const user = Object.assign({}, ...userData);
            user.birthDate = format(new Date(user.birthDate), 'yyyy-MM-dd');

            const result = await ApiPostRequest('addUser', undefined, user);
           
            if (result.status === 200) {
                setToastComponent({ type: 'success', message: 'User Added Successfully' });
                setUsers([...users, user]);
            }
            else {
                result.body = JSON.parse(result.body);
                setToastComponent({ type: 'error', message: 'Failed to add user.'});
            }
            setResponse(result);
        } catch (error) {
            console.log('Error:', error);
        }
    };

    useEffect(() => {
        setModalFields([
            {
                key: "firstName",
                label: "First Name",
                type: "text",
                value: undefined,
                rules: [
                    { pattern: /^[A-Z]/, message: 'First letter should be capital!' },
                    { pattern: /^[a-zA-Z]+$/, message: 'Only letters are allowed!' }
                ],
            },
            {
                key: "lastName",
                label: "Last Name",
                type: "text",
                value: undefined,
                rules: [
                    { pattern: /^[A-Z]/, message: 'First letter should be capital!' },
                    { pattern: /^[a-zA-Z]+$/, message: 'Only letters are allowed!' }
                ]
            },
            {
                key: "username",
                label: "Username",
                type: "text",
                value: undefined
            },
            {
                key: "email",
                label: "Email",
                type: "text",
                value: undefined,
                rules: [
                    { type: 'email', message: 'The input is not valid E-mail!' }
                ]
            },
            {
                key: "password",
                label: "Password",
                type: "text",
                value: undefined,
                rules: [
                    { min: 6, message: 'Password must be at least 6 characters!' },
                    { pattern: /^(?=.*[0-9])\S+$/, message: 'Password must have at least one digit!' },
                    { pattern: /^(?=.*[a-z])\S+$/, message: 'Password must have at least one lowercase letter!' },
                    { pattern: /^(?=.*[A-Z])\S+$/, message: 'Password must have at least one uppercase letter!' },
                    { pattern: /^(?=.*[^A-Za-z0-9])\S+$/, message: 'Password must have at least one non-alphanumeric character!' },
                ],
            },
            {
                key: "birthDate",
                label: "Birthdate",
                type: "date",
                value: undefined
            },
            {
                key: "role",
                label: "Role",
                type: "select",
                value: undefined,
                options: [
                    { value: 'Not Assigned', label: 'Not Assigned' },
                    { value: 'Admin', label: 'Admin' },
                    { value: 'Teacher', label: 'Teacher' },
                    { value: 'Student', label: 'Student' },
                ]
            }
        ]);
    }, []);

    return (
        <>
            {
                modalFields && modalFields.length > 0 &&
                <ModalForm isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} fields={modalFields} title="Add New User" handleSave={handleSave} response={response} />
            }
        </>
    );
};

export default AddUserModal;

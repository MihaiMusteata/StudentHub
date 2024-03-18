import { FC, useEffect, useState } from 'react';
import { User } from '../../scripts/user';
import { format } from 'date-fns';
import ModalForm from '../ModalForm';
import { FieldConfig as ModalFields } from '../ModalForm';
import { ApiPutRequest, ApiResponse } from '../../scripts/api';
import { toastProps } from '../../App';

interface EditUserModalProps {
    id: string;
    users: User[];
    isModalOpen: boolean;
    setIsModalOpen: (isModalOpen: boolean) => void;
    setUsers: (users: User[]) => void;
    setToastComponent: (toastComponent: toastProps) => void;
}

const EditUserModal: FC<EditUserModalProps> = ({ id, users, isModalOpen, setIsModalOpen, setUsers, setToastComponent }) => {
    const [modalFields, setModalFields] = useState<ModalFields[]>([]);
    const [response, setResponse] = useState<ApiResponse>({ status: 0, body: {} });

    const handleSave = async (data: ModalFields[]) => {
        try {
            const userData = data.map(field => {
                return { [field.key]: field.value };
            });
            const user = Object.assign({}, ...userData);
    
            user.id = id;
            
            const result = await ApiPutRequest('updateUser', undefined, user);

            if (result.status === 200) {
                const newUsers = users.map(u => { return u.id === id ? user : u; });
                setToastComponent({ type: 'success', message: 'User Updated Successfully' });
                setUsers(newUsers);
            } else {
                result.body = JSON.parse(result.body);
                setToastComponent({ type: "error", message: "Failed to update user." });
            }

            setResponse(result);
        } catch (error) {
            console.log('Error:', error);
        }
    };

    useEffect(() => {
        const currentUser = users.find(user => user.id === id);
        if (currentUser) {
            setModalFields([
                {
                    key: "firstName",
                    label: "First Name",
                    type: "text",
                    value: currentUser.firstName,
                    rules: [
                        { pattern: /^[A-Z]/, message: 'First letter should be capital!' },
                        { pattern: /^[a-zA-Z]+$/, message: 'Only letters are allowed!' }
                    ],
                },
                {
                    key: "lastName",
                    label: "Last Name",
                    type: "text",
                    value: currentUser.lastName,
                    rules: [
                        { pattern: /^[A-Z]/, message: 'First letter should be capital!' },
                        { pattern: /^[a-zA-Z]+$/, message: 'Only letters are allowed!' }
                    ],
                },
                {
                    key: "userName",
                    label: "Username",
                    type: "text",
                    value: currentUser.userName,
                },
                {
                    key: "email",
                    label: "Email",
                    type: "text",
                    value: currentUser.email,
                    rules: [
                        { type: 'email', message: 'The input is not valid E-mail!' }
                    ],
                },
                {
                    key: "birthDate",
                    label: "Birthdate",
                    type: "date",
                    value: format(new Date(currentUser.birthDate), 'yyyy-MM-dd'),
                },
                {
                    key: "role",
                    label: "Role",
                    type: "select",
                    value: currentUser.role,
                    options: [
                        { value: 'Not Assigned', label: 'Not Assigned' },
                        { value: 'Admin', label: 'Admin' },
                        { value: 'Teacher', label: 'Teacher' },
                        { value: 'Student', label: 'Student' },
                    ],
                }
            ]);
        }
    }, [id]);

    return (
        <>
            {
                modalFields && modalFields.length > 0 &&
                <ModalForm isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} fields={modalFields} title="Edit User" handleSave={handleSave} response={response} />
            }
        </>
    );
};

export default EditUserModal;
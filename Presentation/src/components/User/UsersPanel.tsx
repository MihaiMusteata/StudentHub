import { FC, useContext, useEffect, useState } from 'react';
import Panel from '../Panel';
import AddUserModal from './AddUserModal';
import { ApiResponse, ApiGetRequest, ApiDeleteRequest } from '../../scripts/api';
import { format } from 'date-fns';
import { User } from '../../scripts/user';
import EditUserModal from './EditUserModal';
import { ToastContext } from '../../App';


const UsersPanel: FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [userId, setUserId] = useState<string>('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const setToastComponent = useContext(ToastContext);

    const fetchUsers = async () => {
        try {
            const result = await ApiGetRequest('users');
            const response = result as ApiResponse;
            if (response.status === 200) {
                const users = response.body as User[];
                setUsers(users);
            }
        } catch (error) {
            console.log('Error:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [users.length]);

    const handleEdit = (id: string): void => {
        setIsEditModalOpen(true);
        setUserId(id);
    };

    const handleDelete = async (id: string): Promise<void> => {
        try {
            const result = await ApiDeleteRequest('deleteUser', { userId: id });
            const response = result as ApiResponse;

            if (response.status === 200) {
                setToastComponent({ type: 'success', message: 'User Deleted' });
                setUsers(users.filter(user => user.id !== id));
            }
            else {
                response.body = JSON.parse(response.body);
                setToastComponent({ type: 'error', message: 'Failed to delete user. ' + response.body.general });
            }
        } catch (error) {
            console.log('Error:', error);
        }
    };

    return (
        <>
            <Panel
                setIsAddModalOpen={setIsAddModalOpen}
                columns={['ID', 'First Name', 'Last Name', 'Username', 'Email', 'Birthday', 'Role']}
                data={users.map(user => ({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    userName: user.userName,
                    email: user.email,
                    birthDate: format(new Date(user.birthDate), 'yyyy-MM-dd'),
                    role: user.role
                }))
                }
                title="Users Table"
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            {
                isAddModalOpen &&
                <AddUserModal users={users} isModalOpen={isAddModalOpen} setIsModalOpen={setIsAddModalOpen} setUsers={setUsers} setToastComponent={setToastComponent} />
            }
            {
                isEditModalOpen &&
                <EditUserModal id={userId} users={users} setUsers={setUsers} isModalOpen={isEditModalOpen} setIsModalOpen={setIsEditModalOpen} setToastComponent={setToastComponent} />
            }

        </>
    );
};

export default UsersPanel;

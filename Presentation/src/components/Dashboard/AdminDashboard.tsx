import { FC, useEffect, useState } from 'react';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { Link } from 'react-router-dom';
import { ApiGetRequest } from '../../scripts/api.tsx';

interface PlatfromUsers {
  users: number;
  teachers: number;
  students: number;
}

const AdminDashboard: FC = () => {
  const [ users, setUsers ] = useState<PlatfromUsers>({users: 0, teachers: 0, students: 0});
  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  const fetchField = async (field: string) => {
    const result = await ApiGetRequest(field);
    if (result) {
      setIsLoading(false);
    }
    if (result.status === 200) {
      return result.body;
    }
    return [];
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchUsers = async () => {
      const users = await fetchField('users');
      const teachers = await fetchField('teachers');
      const students = await fetchField('students');
      setUsers({users: users.length, teachers: teachers.length, students: students.length});
    };
    fetchUsers();
  }, []);

  const Card = ({type, title, value, icon, link, linkName}: {
    type: string,
    title: string,
    value: number | string,
    icon: JSX.Element,
    link: string,
    linkName: string
  }) => {
    return (
      <>
        <div className='col-md-4 col-sm-12 mb-xl-0 mb-4'>
          <div className='card'>
            <div className='card-header p-3 pt-2'>
              <div className={`icon icon-lg icon-shape bg-gradient-${type} shadow-${type} text-center border-radius-xl mt-n4 position-absolute d-flex justify-content-center align-items-center`}>
                {icon}
              </div>
              <div className='text-end pt-1'>
                <p className='text-sm mb-0 text-capitalize'>{title}</p>
                <h4 className='mb-0'>{value}</h4>
              </div>
            </div>
            <hr className='dark horizontal my-0' />
            <div className='card-footer p-3'>
              <p className='mb-0'>
                <Link className='text-sm' to={link}>{linkName}</Link>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <div className='container-fluid py-4'>
        <div className='row'>
          <Card
            type='primary'
            title='Total Users'
            value={isLoading ? 'Loading...' : users.users}
            icon={<PeopleAltIcon className='text-white' />}
            link='/users'
            linkName='View all'
          />
          <Card
            type='success'
            title='Total Teachers'
            value={isLoading ? 'Loading...' : users.teachers}
            icon={<PeopleAltIcon className='text-white' />}
            link='/teachers'
            linkName='View all'
          />
          <Card
            type='info'
            title='Total Students'
            value={isLoading ? 'Loading...' : users.students}
            icon={<PeopleAltIcon className='text-white' />}
            link='/students'
            linkName='View all'
          />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
import { useContext, useEffect, useState } from "react";
import IdentityCard, { FieldConfig as ModalFields } from '../IdentityCard';
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContext } from "../../App";
import { Teacher } from "../../scripts/teacher";
import { ApiGetRequest, ApiPostRequest, ApiPutRequest } from "../../scripts/api";
import { format } from "date-fns";
import { User } from "../../scripts/user";

const TeacherDetails = () => {

    const [teacher, setTeacher] = useState<Teacher | undefined>(undefined);
    const [modalFields, setModalFields] = useState<ModalFields[]>([]);
    const [universitiesField, setUniversities] = useState<{ universities: any[] }>({ universities: [] });
    const setToastComponent = useContext(ToastContext);

    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    const fetchField = async (field: string) => {
        const result = await ApiGetRequest(field);

        if (result.status === 200) {
            return result.body;
        }
        return [];
    };

    const handleSave = async (data: ModalFields[]) => {

        const userData = data.map(field => {
            return { [field.key]: field.value };
        });

        const updatedTeacher = Object.assign({}, ...userData);

        try {
            if (id) {
                const result = await ApiPutRequest('updateTeacher', undefined, updatedTeacher);
                if (result.status === 200) {
                    setToastComponent({ type: 'success', message: 'Teacher Updated Successfully' });
                    setTeacher(updatedTeacher);
                }
                else {
                    result.body = JSON.parse(result.body);
                    setToastComponent({ type: 'error', message: 'Failed to update teacher.\n' + result.body.general });
                }
            }
            else if (userId) {
                updatedTeacher.id = "0";
                
                const result = await ApiPostRequest('updateTeacher', undefined, updatedTeacher);

                if (result.status === 200) {
                    setToastComponent({ type: 'success', message: 'Teacher Updated Successfully' });
                    setTeacher(updatedTeacher);
                    navigate('/teachers');
                }
                else {
                    result.body = JSON.parse(result.body);
                    setToastComponent({ type: 'error', message: 'Failed to update teacher.\n' + result.body.general });
                }
            }
        } catch (error) {
            console.log('Error:', error);
        }
    }

    const fetchTeacher = async () => {
        try {
            if (id) {
                const result = await ApiGetRequest('teacher', { teacherId: id });
                console.log('Result:', result);
                if (result.status === 200) {
                    const teacher = result.body as Teacher;
                    teacher.birthDate = format(new Date(teacher.birthDate), 'yyyy-MM-dd');
                    setTeacher(teacher);
                }
                else {
                    result.body = JSON.parse(result.body);
                    setToastComponent({ type: 'error', message: 'Failed to fetch teacher.\n' + result.body.general });
                    navigate('/teachers');
                }
            }
            else if (userId) {
                const result = await ApiGetRequest('user', { userId: userId });
                if (result.status === 200) {
                    const user = result.body as User;
                    user.birthDate = format(new Date(user.birthDate), 'yyyy-MM-dd');
                    const teacher = {
                        id: "Temporarily unavailable",
                        userId: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        birthDate: user.birthDate,
                        universityId: 0,
                    }
                    setTeacher(teacher);
                }
                else {
                    result.body = JSON.parse(result.body);
                    setToastComponent({ type: 'error', message: 'Failed to fetch teacher.\n' + result.body.general });
                    navigate('/teachers');
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    useEffect(() => {
        fetchTeacher();
    }, []);

    useEffect(() => {
        const fetchFields = async () => {
            const universities = await fetchField('universities');
            setUniversities({ universities: universities });
        };
        fetchFields();
    }, []);

    useEffect(() => {
        setModalFields([
            {
                key: 'id',
                editable: false,
                label: 'ID',
                value: teacher?.id,
                type: 'text',
            },
            {
                key: 'userId',
                editable: false,
                label: 'User ID',
                value: teacher?.userId,
                type: 'text',
            },
            {
                key: 'firstName',
                editable: true,
                label: 'First Name',
                value: teacher?.firstName,
                type: 'text',
                rules: [
                    { pattern: /^[A-Z]/, message: 'First letter should be capital!' },
                    { pattern: /^[a-zA-Z]+$/, message: 'Only letters are allowed!' }
                ]
            },
            {
                key: 'lastName',
                editable: true,
                label: 'Last Name',
                value: teacher?.lastName,
                type: 'text',
                rules: [
                    { pattern: /^[A-Z]/, message: 'First letter should be capital!' },
                    { pattern: /^[a-zA-Z]+$/, message: 'Only letters are allowed!' }
                ]
            },
            {
                key: 'birthDate',
                editable: true,
                label: 'Birth Date',
                value: teacher?.birthDate,
                type: 'date',

            },
            {
                key: 'universityId',
                editable: true,
                label: 'University',
                value: teacher?.universityId || undefined,
                type: 'select',
                options: universitiesField.universities.map(university => {
                    return { value: university.id, label: university.name };
                })
            },
        ]);
    }, [teacher, universitiesField]);

    return (
        <>
            {
                modalFields && modalFields.length > 0 && teacher &&
                <IdentityCard
                    fields={modalFields}
                    title={'Teacher ' + teacher.firstName + ' ' + teacher.lastName}
                    handleSave={handleSave}
                />
            }
        </>
    );
};

export default TeacherDetails;
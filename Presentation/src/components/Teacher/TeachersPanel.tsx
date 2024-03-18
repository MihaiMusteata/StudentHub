import { useContext, useEffect, useState } from "react";
import { Teacher } from "../../scripts/teacher";
import { ToastContext } from "../../App";
import { useNavigate } from "react-router-dom";
import { ApiDeleteRequest, ApiGetRequest } from "../../scripts/api";
import Panel from "../Panel";
import { format } from "date-fns";
import AddTeacherModal from "./AddTeacherModal";

interface UniversityFields {
    universities: any[];
    disciplines: any[];
}

const TeachersPanel = () => {
    const [universities, setUniversities] = useState<UniversityFields>({ universities: [], disciplines: [] });
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
            const [univs, disc] = await Promise.all([
                fetchField('universities'),
                fetchField('disciplines')
            ]);
            console.log('univs:', univs);
            console.log('disc:', disc);
            setUniversities({ universities: univs, disciplines: disc });

        } catch (error) {
            console.error('Error fetching fields:', error);
        }
    };

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
            const response = await ApiDeleteRequest('deleteTeacher', { teacherId: id });

            if (response.status === 200) {
                setToastComponent({ type: 'success', message: 'Teacher Deleted Successfully' });
                setTeachers(teachers.filter(teacher => teacher.id != id));
            }
            else {
                response.body = JSON.parse(response.body);
                setToastComponent({ type: 'error', message: 'Failed to delete teacher.\n' + response.body.general });
            }
        } catch (error) {
            console.log('Error:', error);
        }
    };

    const handleInfo = (id: string): void => {
        navigate('/teachers/teacher?id=' + id);
    }

    useEffect(() => {
        fetchFields();
    }, [universities.universities.length, universities.disciplines.length]);

    useEffect(() => {
        fetchTeachers();
    }, [teachers.length]);


    return (
        <>
            <Panel
                setIsAddModalOpen={setIsAddModalOpen}
                columns={['ID', 'First Name', 'Last Name', 'Birth Date', 'University', 'Discipline']}
                data={teachers.map(teacher => ({
                    id: teacher.id,
                    firstName: teacher.firstName,
                    lastName: teacher.lastName,
                    birthDate: format(new Date(teacher.birthDate), 'yyyy-MM-dd'),
                    university: universities.universities.find(university => university.id === teacher.universityId)?.name,
                    discipline: universities.disciplines.find(discipline => discipline.id === teacher.disciplineId)?.name
                }))}
                title="Teachers Table"
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
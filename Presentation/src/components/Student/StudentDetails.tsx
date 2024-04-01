import { useLocation, useNavigate } from 'react-router-dom';
import { Student } from '../../scripts/student';
import { ApiGetRequest, ApiPutRequest, ApiPostRequest } from '../../scripts/api';
import { useContext, useEffect, useState } from 'react';
import IdentityCard from '../IdentityCard';
import { format } from 'date-fns';
import { FieldConfig as ModalFields } from '../IdentityCard';
import { User } from '../../scripts/user';
import { ToastContext } from '../../App';

interface UniversityFields {
  universities: any[];
  faculties: any[];
  departments: any[];
  specialties: any[];
  groups: any[];
}


const StudentDetails = () => {
  
  const [student, setStudent] = useState<Student | undefined>(undefined);
  const [modalFields, setModalFields] = useState<ModalFields[]>([]);
  const [universitiesField, setUniversities] = useState<UniversityFields>({ universities: [], faculties: [], departments: [], specialties: [], groups: [] });
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

    const updatedStudent = Object.assign({}, ...userData);

    try {
      if (id) {
        const result = await ApiPutRequest('updateStudent', undefined, updatedStudent);
        if (result.status === 200) {
          setToastComponent({ type: 'success', message: 'Student Updated Successfully' });
          setStudent(updatedStudent);
        }
        else {
          result.body = JSON.parse(result.body);
          setToastComponent({ type: 'error', message: 'Failed to update student.\n' + result.body.general });
        }
      }
      else if (userId) {
        updatedStudent.id = "0";
        console.log('Add student:', updatedStudent);

        const result = await ApiPostRequest('addStudent', undefined, updatedStudent);

        if (result.status === 200) {
          setToastComponent({ type: 'success', message: 'Student Added Successfully' });
          setStudent(updatedStudent);
          navigate('/students');
        }
        else {
          result.body = JSON.parse(result.body);
          setToastComponent({ type: 'error', message: 'Failed to add student.\n' + result.body.general });
        }
      }
    }
    catch (error) {
      console.error('Error:', error);
    }
  }


  const fetchStudent = async () => {
    try {
      if (id) {
        const result = await ApiGetRequest('studentById', { studentId: id });
        if (result.status === 200) {
          const st = result.body as Student;
          st.birthDate = format(new Date(st.birthDate), 'yyyy-MM-dd');
          st.enrollmentDate = format(new Date(st.enrollmentDate), 'yyyy-MM-dd');
          st.graduationDate = format(new Date(st.graduationDate), 'yyyy-MM-dd');
          setStudent(st);
        }
        else {
          result.body = JSON.parse(result.body);
          setToastComponent({ type: 'error', message: result.body.general });
          navigate('/students');
        }
      }
      else if (userId) {
        const result = await ApiGetRequest('user', { userId: userId });
        if (result.status === 200) {
          const user = result.body as User;
          user.birthDate = format(new Date(user.birthDate), 'yyyy-MM-dd');
          const st = {
            id: "Temporarily unavailable",
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            departmentId: 0,
            birthDate: user.birthDate,
            enrollmentDate: "",
            enrollmentNumber: "",
            financeType: "",
            facultyId: 0,
            universityId: 0,
            studyFrequency: "",
            specialtyId: 0,
            scholarshipType: "",
            graduationDate: "",
            degreeType: "",
            year: "",
            groupId: 0
          };
          setStudent(st);
        }
        else {
          result.body = JSON.parse(result.body);
          setToastComponent({ type: 'error', message: result.body.general });
          navigate('/students');
        }
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  const fetchFields = async () => {
    try {
      if (!universitiesField.universities.length) {
        const [univs, facs, deps, specs, grps] = await Promise.all([
          fetchField('universities'),
          fetchField('faculties'),
          fetchField('departments'),
          fetchField('specialties'),
          fetchField('groups')
        ]);
        setUniversities({ universities: univs, faculties: facs, departments: deps, specialties: specs, groups: grps });
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  useEffect(() => {
    fetchFields();
  }, []);

  useEffect(() => {
    setModalFields([
      {
        key: "id",
        editable: false,
        label: "Id",
        type: "text",
        value: student?.id
      },
      {
        key: "userId",
        editable: false,
        label: "User Id",
        type: "text",
        value: student?.userId
      },
      {
        key: "firstName",
        editable: true,
        label: "First Name",
        type: "text",
        value: student?.firstName || "",
        rules: [
          { pattern: /^[A-Z]/, message: 'First letter should be capital!' },
          { pattern: /^[a-zA-Z]+$/, message: 'Only letters are allowed!' }
        ]
      },
      {
        key: "lastName",
        editable: true,
        label: "Last Name",
        type: "text",
        value: student?.lastName || "",
        rules: [
          { pattern: /^[A-Z]/, message: 'First letter should be capital!' },
          { pattern: /^[a-zA-Z]+$/, message: 'Only letters are allowed!' }
        ]
      },
      {
        key: "birthDate",
        editable: true,
        label: "Birth Date",
        type: "date",
        value: student?.birthDate || "",
      },
      {
        key: "year",
        editable: true,
        label: "Year",
        type: "text",
        value: student?.year || "",
      },
      {
        key: "universityId",
        editable: true,
        label: "University",
        type: "select",
        value: student?.universityId || undefined,
        options: universitiesField.universities.map(u => {
          return { value: u.id, label: u.name };
        })
      },
      {
        key: "facultyId",
        editable: true,
        label: "Faculty",
        type: "select",
        value: student?.facultyId || undefined,
        options: universitiesField.faculties.map(f => {
          return { value: f.id, label: f.name };
        })
      },
      {
        key: "departmentId",
        editable: true,
        label: "Department",
        type: "select",
        value: student?.departmentId || undefined,
        options: universitiesField.departments.map(d => {
          return { value: d.id, label: d.name };
        })
      },
      {
        key: "specialtyId",
        editable: true,
        label: "Specialty",
        type: "select",
        value: student?.specialtyId || undefined,
        options: universitiesField.specialties.map(s => {
          return { value: s.id, label: s.name };
        })
      },
      {
        key: "groupId",
        editable: true,
        label: "Group",
        type: "select",
        value: student?.groupId || undefined,
        options: universitiesField.groups.map(g => {
          return { value: g.id, label: g.name };
        })
      },
      {
        key: "enrollmentNumber",
        editable: true,
        label: "Enrollment Number",
        type: "text",
        value: student?.enrollmentNumber || "",
      },
      {
        key: "financeType",
        editable: true,
        label: "Finance Type",
        type: "text",
        value: student?.financeType || "",
      },
      {
        key: "studyFrequency",
        editable: true,
        label: "Study Frequency",
        type: "text",
        value: student?.studyFrequency || "",
      },
      {
        key: "degreeType",
        editable: true,
        label: "Degree Type",
        type: "text",
        value: student?.degreeType || "",
      },
      {
        key: "scholarshipType",
        editable: true,
        label: "Scholarship Type",
        type: "text",
        value: student?.scholarshipType || "",
      },
      {
        key: "enrollmentDate",
        editable: true,
        label: "Enrollment Date",
        type: "date",
        value: student?.enrollmentDate || "",
      },
      {
        key: "graduationDate",
        editable: true,
        label: "Graduation Date",
        type: "date",
        value: student?.graduationDate || "",
      },
    ]);
  }, [student]);

  
  return (
    <>
      {
        modalFields && modalFields.length > 0 && student &&
        <IdentityCard
          fields={modalFields}
          title={'Student ' + student?.firstName + ' ' + student?.lastName}
          handleSave={handleSave}
        />
      }
    </>
  );
};

export default StudentDetails;
import { useUser } from '../../context/userContext.tsx';
import { ApiGetRequest } from '../../scripts/api.tsx';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Grade {
  gradeItem: string;
  grade: number;
}

const CourseGradesInfo = () => {
  const [ student, setStudent ] = useState<any>({});
  const [ grades, setGrades ] = useState<Grade[]>([]);

  const {user} = useUser();

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const id = searchParams.get('id') as unknown as number;
  const fetchStudent = async () => {
    try {
      const result = await ApiGetRequest('studentByUserId', {userId: user!.id});
      if (result.status === 200) {
        setStudent(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchGrades = async () => {
    try {
      const result = await ApiGetRequest('studentGrades', {courseId: id, studentId: student.id});
      if (result.status === 200) {
        setGrades(result.body);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  useEffect(() => {
    if (student.id) {
      fetchGrades();
    }
  }, [ student.id ]);

  return (
    <div className='container-fluid py-4'>
      <div className='row'>
        <div className='col-12'>
          <div className='card my-4'>
            <div className='card-header p-0 position-relative mt-n4 mx-3 z-index-2'>
              <div className='d-flex justify-content-start align-items-center bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3 px-3'>
                <ArrowBackIcon
                  style={{color: 'white', cursor: 'pointer', marginRight: '20px'}}
                  onClick={() => handleGoBack()}
                />
                <h4 className='text-white text-capitalize mb-0'>{`Grades`}</h4>
              </div>
            </div>
            <div className='card-body px-0 pb-2'>
              <div className='table-responsive p-0'>
                <table className='table align-items-center mb-0'>
                  <thead>
                  <tr>
                    <th className='text-secondary opacity-7 align-middle text-center'>Assignment</th>
                    <th className='text-secondary opacity-7 align-middle text-center'>Range</th>
                    <th className='text-secondary opacity-7 align-middle text-center'>Grade</th>
                    <th className='text-secondary opacity-7 align-middle text-center'>Percentage</th>
                    <th className='text-secondary opacity-7 align-middle text-center'>Contribution to course total</th>
                  </tr>
                  </thead>
                  <tbody>
                  {
                    grades.map((grade, index) => (
                      <tr key={index} style={{color: 'black'}}>
                        <td className='align-middle text-center'>{grade.gradeItem}</td>
                        <td className='align-middle text-center'>1-10</td>
                        <td className='align-middle text-center'>{grade.grade}</td>
                        <td className='align-middle text-center'>{grade.grade * 10}%</td>
                        <td className='align-middle text-center'>{(Math.round((1 / grades.length) * 100 * 100) / 100).toFixed(2)}%</td>
                      </tr>
                    ))
                  }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CourseGradesInfo;
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, Dispatch } from 'react';
import { ApiGetRequest, ApiResponse } from './scripts/api';
import Signup from './components/Signup';
import Login from './components/Login';
import Layout from './components/Layouts/Layout';
import UsersPanel from './components/User/UsersPanel';
import Dashboard from './components/Dashboard';
import { User } from './scripts/user';
import StudentsPanel from './components/Student/StudentsPanel';
import StudentDetails from './components/Student/StudentDetails';
import LoadingScreen from './components/LoadingScreen';
import { ToastContainer, toast } from 'react-toastify';
import Test from './components/Test';
import 'react-toastify/dist/ReactToastify.css';
import TeachersPanel from './components/Teacher/TeachersPanel';
import TeacherDetails from './components/Teacher/TeacherDetails';

export interface toastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

const toastStyle = {
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: 'light',
};

type SetToastComponentFunction = Dispatch<React.SetStateAction<toastProps | undefined>>;
export const ToastContext = createContext<SetToastComponentFunction>(() => { });

function App() {
  const [ user, setUser ] = useState<User | undefined>(undefined);
  const [ updateUser, setUpdateUser ] = useState(false);
  const [ isLoading, setIsLoading ] = useState(true);
  const [ toastComponent, setToastComponent ] = useState<toastProps | undefined>(undefined);
  const [ response, setResponse ] = useState<ApiResponse>({status: 0, body: ''});

  useEffect(() => {
    if (toastComponent) {
      switch (toastComponent.type) {
        case 'success':
          toast.success(toastComponent.message, toastStyle);
          break;
        case 'error':
          toast.error(toastComponent.message, toastStyle);
          break;
        case 'info':
          toast.info(toastComponent.message, toastStyle);
          break;
        case 'warning':
          toast.warning(toastComponent.message, toastStyle);
          break;
        default:
          toast(toastComponent.message, toastStyle);
          break;
      }
    }
  }, [ toastComponent ]);

  useEffect(() => {
    setIsLoading(true);
    const fetchProfile = async () => {
      try {
        const result = await ApiGetRequest('profile');
        setResponse(result as ApiResponse);
        if (result.status === 200) {
          const profile = result.body as User;
          setUser(profile);
        }
      } catch (error) {
        console.log('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [ updateUser, response.status ]);

  if (isLoading) {
    return (
      <LoadingScreen />
    );
  }

  return (
    <>
      <Router>
        <ToastContext.Provider value={setToastComponent}>
          <Routes>
            {user ? (
              <Route
                path="/*"
                element={
                  <Layout user={user} setUser={setUser}>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      {user.role === 'Admin' && (
                        <>
                          <Route path="/users" element={<UsersPanel />} />
                          <Route path="/students" element={<StudentsPanel />} />
                          <Route path="/student" element={<StudentDetails />} />
                          <Route path="/teachers" element={<TeachersPanel />} />
                          <Route path="/teacher" element={<TeacherDetails />} />
                        </>
                      )}
                      <Route path="*" element={<Navigate to="/dashboard" />} />
                    </Routes>
                  </Layout>
                }
              />
            ) : (
              <>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login updateUser={updateUser} setUpdateUser={setUpdateUser} />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
            <Route path="/test" element={<Test />} />
          </Routes>
        </ToastContext.Provider>
      </Router>
      <ToastContainer />

    </>
  );
}

export default App;

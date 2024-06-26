import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect, createContext, Dispatch } from 'react';
import { ApiGetRequest, ApiResponse } from './scripts/api';
import Signup from './components/Signup';
import Login from './components/Login';
import Layout from './components/Layouts/Layout';
import UsersPanel from './components/User/UsersPanel';
import { User } from './scripts/user';
import StudentsPanel from './components/Student/StudentsPanel';
import StudentDetails from './components/Student/StudentDetails';
import LoadingScreen from './components/LoadingScreen';
import { ToastContainer, toast } from 'react-toastify';
import Test from './components/Test';
import 'react-toastify/dist/ReactToastify.css';
import TeachersPanel from './components/Teacher/TeachersPanel';
import TeacherDetails from './components/Teacher/TeacherDetails';
import AdminDashboard from './components/Dashboard/AdminDashboard.tsx';
import TeacherDashboard from './components/Dashboard/TeacherDashboard.tsx';
import CoursePage from './components/Course/CoursePage.tsx';
import Courses from './components/Course/Courses.tsx';
import Assignment from './components/Course/CourseComponents/AssignmentComponents/Assignment.tsx';
import UserContext from './context/userContext';
import SearchedCourses from './components/Course/SearchedCourses.tsx';
import AttendanceList from './components/Course/CourseComponents/AttendanceComponents/AttendanceList.tsx';
import SubmissionsList from './components/Course/CourseComponents/AssignmentComponents/SubmissionsList.tsx';
import Grades from './components/Grades/Grades.tsx';
import CourseGradesInfo from './components/Grades/CourseGradesInfo.tsx';
import ForbiddenPage from './components/ForbiddenPage/ForbiddenPage.tsx';
import NotFoundPage from './components/NotFound/NotFound.tsx';
import Chat from './components/Chat/Chat.tsx';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

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
  const [ conn, setConn ] = useState<HubConnection>();
  const [ messages, setMessages ] = useState<string[]>([]);
  const joinChatRoom = async (username, chatroom) => {
    try {
      const connection = new HubConnectionBuilder()
      .withUrl('https://localhost:7277/chat')
      .configureLogging(LogLevel.Information)
      .build();

      connection.on('JoinSpecificChatRoom', (username, msg) => {
        console.log('JoinSpecificChatRoom: ', msg);
        // set message username : msg
        messages.push(`${username}: ${msg}`);
        setMessages(messages);
      });

      connection.on('ReceiveSpecificMessage', (username, msg) => {
        console.log('ReceiveSpecificMessage: ', msg);
        // set message username : msg
        messages.push(`${username}: ${msg}`);
        setMessages(messages);
      });

      await connection.start();
      await connection.invoke('JoinSpecificChatRoom', {username, chatroom});
      setConn(connection);
    } catch (error) {
      console.error(error);
    }
  };

  const sendMessage = async (message) => {
    try {
      await conn.invoke('SendMessage', message);
    } catch (error) {
      console.error(error);
    }
  }
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
    console.log('Profile:', user);
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
          <UserContext.Provider value={{user, setUser}}>
            <Routes>
              {user ? (
                <Route
                  path='/*'
                  element={
                    <Layout user={user} setUser={setUser}>
                      <Routes>
                        {user.role === 'Admin' && (
                          <>
                            <Route path='/dashboard' element={<AdminDashboard />} />
                            <Route path='/users' element={<UsersPanel />} />
                            <Route path='/students' element={<StudentsPanel />} />
                            <Route path='/students/student' element={<StudentDetails />} />
                            <Route path='/teachers' element={<TeachersPanel />} />
                            <Route path='/teachers/teacher' element={<TeacherDetails />} />
                          </>
                        )}
                        {user.role === 'Teacher' && (
                          <>
                            <Route path='/dashboard' element={<TeacherDashboard />} />
                            <Route path='/courses' element={<Courses fullPage={true} />} />
                            <Route path='/courses/course' element={<CoursePage />} />
                            <Route path='/courses/assignment' element={<Assignment />} />
                            <Route path='/courses/course/:courseId/attendance' element={<AttendanceList />} />
                            <Route
                              path='/courses/course/:courseId/assignment/:assignmentId/submissions'
                              element={<SubmissionsList />}
                            />
                          </>
                        )}
                        {user.role === 'Student' && (
                          <>
                            <Route path='/courses' element={<Courses fullPage={true} />} />
                            <Route path='/courses/course' element={<CoursePage />} />
                            <Route path='/courses/assignment' element={<Assignment />} />
                            <Route path='/courses/search' element={<SearchedCourses />} />
                            <Route path='/grades' element={<Grades />} />
                            <Route path='/grades/course' element={<CourseGradesInfo />} />
                          </>
                        )}
                        <Route path='*' element={<Navigate to='/dashboard' />} />
                        <Route path='/forbidden-page' element={<ForbiddenPage />} />
                        <Route path='/not-found' element={<NotFoundPage />} />
                      </Routes>
                    </Layout>
                  }
                />
              ) : (
                <>
                  <Route path='/signup' element={<Signup />} />
                  <Route path='/login' element={<Login updateUser={updateUser} setUpdateUser={setUpdateUser} />} />
                  <Route path='/forbidden-page' element={<ForbiddenPage />} />
                  <Route path='/not-found' element={<NotFoundPage />} />
                  <Route path='*' element={<Navigate to='/login' />} />
                </>
              )}
              <Route path='/test' element={<Test />} />
              <Route path='/chat' element={<Chat conn={conn} joinChatRoom={joinChatRoom} messages={messages} sendMessage={sendMessage} />} />
              
            </Routes>
          </UserContext.Provider>
        </ToastContext.Provider>
      </Router>
      <ToastContainer />

    </>
  );
}

export default App;

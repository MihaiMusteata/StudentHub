import axios, { AxiosResponse, Method } from 'axios';
import { Dispatch, SetStateAction } from 'react';
import { toastProps } from '../App.tsx';

interface ApiEndpoints {
  [key: string]: (params?: any) => string;
}

const API_ENDPOINTS: ApiEndpoints = {
  // Authentication
  'login': () => `/api/Auth/login`,
  'signup': () => `/api/Auth/signup`,
  'profile': () => `/api/Profile/profile`,

  // Users
  'users': () => `/api/Users/users`,
  'user': (params?: any) => `/api/Users/user?id=${params?.userId}`,
  'deleteUser': (params?: any) => `/api/Users/user?id=${params?.userId}`,
  'updateUser': () => `/api/Users/user`,
  'addUser': () => `/api/Users/user`,

  // Students
  'students': () => `/api/Students/students`,
  'studentById': (params?: any) => `/api/Students/student/id/${params?.studentId}`,
  'studentByUserId': (params?: any) => `/api/Students/student/user-id/${params?.userId}`,
  'deleteStudent': (params?: any) => `/api/Students/student?id=${params?.studentId}`,
  'updateStudent': () => `/api/Students/student`,
  'addStudent': () => `/api/Students/student`,

  // Submissions
  'groupSubmissions': (params?: any) => `/api/Submissions/group-submissions?courseId=${params?.courseId}&assignmentId=${params?.assignmentId}&groupId=${params?.groupId}`,

  // StudentCourse
  'enrollStudent': () => `/api/StudentCourse/enroll`,
  'unenrollStudent': (params?: any) => `/api/StudentCourse/unenroll?studentId=${params?.studentId}&courseId=${params?.courseId}`,
  'uploadSubmission': (params?: any) => `/api/StudentCourse/upload-submission/${params?.studentId}/${params?.lessonAssignmentId}`,
  'submissions': (params?: any) => `/api/StudentCourse/submissions?studentId=${params?.studentId}&lessonAssignmentId=${params?.lessonAssignmentId}`,
  'studentGrades': (params?: any) => `/api/StudentCourse/grades?studentId=${params?.studentId}&courseId=${params?.courseId}`,

  // Group
  'studentsFromGroup': (params?: any) => `/api/Group/students/${params?.groupId}`,

  // Teachers
  'teachers': () => `/api/Teachers/teachers`,
  'teacherById': (params?: any) => `/api/Teachers/teacher/id/${params?.id}`,
  'teacherByUserId': (params?: any) => `/api/Teachers/teacher/user-id/${params?.userId}`,
  'deleteTeacher': (params?: any) => `/api/Teachers/teacher?id=${params?.teacherId}`,
  'updateTeacher': () => `/api/Teachers/teacher`,
  'addTeacher': () => `/api/Teachers/teacher`,

  // Admin
  'universities': () => `/api/Admin/universities`,
  'departments': () => `/api/Admin/departments`,
  'faculties': () => `/api/Admin/faculties`,
  'specialties': () => `/api/Admin/specialties`,
  'disciplines': () => `/api/Admin/disciplines`,
  'groups': () => `/api/Admin/groups`,

  // Course
  'teacherCourses': (params?: any) => `/api/Course/teacher-courses?teacherId=${params?.teacherId}`,
  'studentCourses': (params?: any) => `/api/StudentCourse/student-courses?studentId=${params?.studentId}`,
  'enrolledGroups': (params?: any) => `/api/Course/enrolled-groups?courseId=${params?.courseId}`,
  'enrolledStudents': (params?: any) => `/api/Course/enrolled-students?courseId=${params?.courseId}&groupId=${params?.groupId}`,
  'courseLessons': (params?: any) => `/api/Course/course-lessons?courseId=${params?.courseId}`,
  'course': (params?: any) => `/api/Course/course?id=${params?.id}`,
  'addCourse': () => `/api/Course/course`,
  'addAccessKey': () => `/api/Course/access-key`,
  'deleteAccessKeys': () => `/api/Course/access-keys`,
  'accessKeys': (params?: any) => `/api/Course/access-keys?courseId=${params?.courseId}`,
  'availableTeachers': (params?: any) => `/api/Course/available-teachers?courseId=${params?.courseId}`,
  'assignTeacherToCourse': (params?: any) => `/api/Course/assign-teacher-to-course?courseId=${params?.courseId}&teacherId=${params?.teacherId}`,
  'removeTeacherFromCourse': (params?: any) => `/api/Course/remove-teacher-from-course?courseId=${params?.courseId}&teacherId=${params?.teacherId}`,
  'courseTeachers': (params?: any) => `/api/Course/course-teachers?courseId=${params?.courseId}`,
  'searchCourses': (params?: any) => `/api/Course/search-courses?search=${params?.search}`,
  'totalAssignments': (params?: any) => `/api/Course/total-assignments?courseId=${params?.courseId}`,

  // Lesson
  'lesson': (params?: any) => `/api/Lesson/lesson?id=${params?.lessonId}`,
  'lessonDocuments': (params?: any) => `/api/Lesson/lesson-documents?lessonId=${params?.lessonId}`,
  'addLesson': () => '/api/Lesson/lesson',
  'deleteLesson': (params?: any) => `/api/Lesson/lesson?id=${params.id}`,
  'updateLesson': () => '/api/Lesson/lesson',
  'uploadLessonDocument': (params?: any) => `/api/Lesson/upload-document/${params?.lessonId}`,

  // Lesson Assignment
  'addLessonAssignment': () => `/api/LessonAssignment/assignment`,
  'lessonAssignment': (params?: any) => `/api/LessonAssignment/assignment?id=${params?.id}`,
  'deleteLessonAssignment': (params?: any) => `/api/LessonAssignment/assignment?id=${params?.id}`,
  'updateLessonAssignment': () => `/api/LessonAssignment/assignment`,
  'lessonAssignments': (params?: any) => `/api/LessonAssignment/assignments/${params?.lessonId}`,
  'uploadAssignmentDocument': (params?: any) => `/api/LessonAssignment/upload-document/${params?.lessonAssignmentId}`,
  'lessonAssignmentResources': (params?: any) => `/api/LessonAssignment/resources/${params?.lessonAssignmentId}`,

  // Lesson Attendance
  'recordAttendance': () => `/api/LessonAttendance/record-attendance`,
  'getAttendance': (params?: any) => `/api/LessonAttendance/get-attendance?courseId=${params?.courseId}&lessonId=${params?.lessonId}&date=${params?.date}&groupId=${params?.groupId}`,

  // Document
  'uploadDocument': () => `/api/Documents/upload`,
  'downloadDocument': (params?: any) => `/api/Documents/download?id=${params?.documentId}`,
  'deleteDocument': (params?: any) => `/api/Documents/document?id=${params?.documentId}`,

  // Grades
  'grade-student': () => `/api/Grades/grade-student`,

};

export interface ApiResponse {
  status: number;
  body: any;
}

const apiRequest = async (method: Method, endpoint: string, params?: any, data?: any): Promise<ApiResponse> => {
    try {
      const url = API_ENDPOINTS[endpoint](params);
      console.log('URL:', url);

      const options: { method: Method; url: string; withCredentials: boolean; data?: any } = {
        method: method,
        url: url,
        data: data,
        withCredentials: true,
      };
      const response: AxiosResponse<ApiResponse> = await axios.request({...options});
      return {status: response.status, body: response.data};
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error;
        console.log('Axios Error:', axiosError);
        switch (axiosError.response?.status) {
          case 404:
            window.location.href = '/not-found';
            break;
          case 403:
            window.location.href = '/forbidden-page';
            break;
          case 401:
            window.location.href = '/login';
            break;
          default:
            break;
        }
        return {status: axiosError.response?.status || 400, body: axiosError.response?.data};
      } else {
        return {status: 400, body: 'Unknown error'};
      }
    }
  }
;

export const ApiPostRequest = async (endpoint: string, params?: any, data?: any): Promise<ApiResponse> => {
  return apiRequest('POST', endpoint, params, data);
};

export const ApiGetRequest = async (endpoint: string, params?: any): Promise<ApiResponse> => {
  return apiRequest('GET', endpoint, params);
};

export const ApiPutRequest = async (endpoint: string, params?: any, data?: any): Promise<ApiResponse> => {
  return apiRequest('PUT', endpoint, params, data);
};

export const ApiDeleteRequest = async (endpoint: string, params?: any, data?: any): Promise<ApiResponse> => {
  return apiRequest('DELETE', endpoint, params, data);
};

export const ApiUploadDocument = async (endpoint: string, formData: FormData, params?: any): Promise<ApiResponse> => {
  try {
    const url = API_ENDPOINTS[endpoint](params);
    console.log('URL:', url);

    const response: AxiosResponse<ApiResponse> = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });
    return {status: response.status, body: response.data};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error;
      console.log('Axios Error:', axiosError);
      return {status: axiosError.response?.status || 400, body: axiosError.response?.data};
    } else {
      return {status: 400, body: 'Unknown error'};
    }
  }
};
export const ApiDownloadDocument = async (
  name: string,
  extension: string,
  endpoint: string,
  setProgress: (progress: number) => void,
  setIsLoading: (isLoading: boolean) => void,
  setToastComponent: Dispatch<SetStateAction<toastProps | undefined>>,
  params?: any,
): Promise<void> => {
  setIsLoading(true);
  const url = API_ENDPOINTS[endpoint](params);
  axios
  .get(url, {
    responseType: 'blob',
    onDownloadProgress: (progressEvent) => {
      const {loaded, total} = progressEvent;
      if (total !== undefined) {
        setProgress(Math.round((loaded * 100) / total));
      }
    },
  })
  .then((response) => {
    const url = window.URL.createObjectURL(new Blob([ response.data ]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name + extension);
    document.body.appendChild(link);
    link.click();
    window.URL.revokeObjectURL(url);
    setTimeout(() => {
      if (response.status === 200) {
        setToastComponent({type: 'success', message: 'Download complete!'});
      } else {
        setToastComponent({type: 'error', message: 'Download failed!'});
      }
      setIsLoading(false);
      setProgress(-1);
    }, 1000);
  })
  .catch((error) => {
    console.error('Error:', error);
    setToastComponent({type: 'error', message: 'Download failed!'});
    setIsLoading(false);
  });
};


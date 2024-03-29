import axios, { AxiosResponse, Method } from 'axios';

interface ApiEndpoints {
    [key: string]: (params?: any) => string;
}

const API_ENDPOINTS: ApiEndpoints = {
    // Authentification
    "login": () => `/api/Auth/login`,
    "signup": () => `/api/Auth/signup`,
    "profile": () => `/api/Profile/profile`,

    // Users
    "users": () => `/api/Users/users`,
    "user": (params?: any) => `/api/Users/user?id=${params?.userId}`,
    "deleteUser": (params?: any) => `/api/Users/user?id=${params?.userId}`,
    "updateUser": () => `/api/Users/user`,
    "addUser": () => `/api/Users/user`,

    // Students
    "students": () => `/api/Students/students`,
    "student": (params?: any) => `/api/Students/student?id=${params?.studentId}`,
    "deleteStudent": (params?: any) => `/api/Students/student?id=${params?.studentId}`,
    "updateStudent": () => `/api/Students/student`,
    "addStudent": () => `/api/Students/student`,

    // Teachers
    "teachers": () => `/api/Teachers/teachers`,
    "teacherById": (params?: any) => `/api/Teachers/teacher/id/${params?.id}`,
    "teacherByUserId": (params?: any) => `/api/Teachers/teacher/user-id/${params?.userId}`,
    "deleteTeacher": (params?: any) => `/api/Teachers/teacher?id=${params?.teacherId}`,
    "updateTeacher": () => `/api/Teachers/teacher`,
    "addTeacher": () => `/api/Teachers/teacher`,

    // Admin
    "universities": () => `/api/Admin/universities`,
    "departments": () => `/api/Admin/departments`,
    "faculties": () => `/api/Admin/faculties`,
    "specialties": () => `/api/Admin/specialties`,
    "disciplines": () => `/api/Admin/disciplines`,
    "groups": () => `/api/Admin/groups`,
    
    // Course
    "teacherCourses": (params?: any) => `/api/Course/teacher-courses?teacherId=${params?.teacherId}`,
    "enrolledGroups": (params?: any) => `/api/Course/enrolled-groups?courseId=${params?.courseId}`,
    "courseLessons": (params?: any) => `/api/Course/course-lessons?courseId=${params?.courseId}`,
    "course": (params?: any) => `/api/Course/course?id=${params?.id}`,
    "addCourse": () => `/api/Course/course`,
    "addAccessKey": () => `/api/Course/access-key`,
    "deleteAccessKeys": () => `/api/Course/access-keys`,
    "accessKeys": (params?: any) => `/api/Course/access-keys?courseId=${params?.courseId}`,
    "availableTeachers": (params?: any) => `/api/Course/available-teachers?courseId=${params?.courseId}`,
    "assignTeacherToCourse": (params?: any) => `/api/Course/assign-teacher-to-course?courseId=${params?.courseId}&teacherId=${params?.teacherId}`,
    "removeTeacherFromCourse": (params?: any) => `/api/Course/remove-teacher-from-course?courseId=${params?.courseId}&teacherId=${params?.teacherId}`,
    "courseTeachers": (params?: any) => `/api/Course/course-teachers?courseId=${params?.courseId}`,
    
    // Lesson
    "lessonDocuments": (params?: any) => `/api/Lesson/lesson-documents?lessonId=${params?.lessonId}`,
    "deleteLessonDocument": (params?: any) => `/api/Lesson/document?lessonId=${params?.lessonId}&documentId=${params?.documentId}`,
    'addLesson': () => '/api/Lesson/lesson',
    'deleteLesson': (params?: any) => `/api/Lesson/lesson?id=${params.id}`,
    'updateLesson': () => '/api/Lesson/lesson',

    // Lesson Assignment
    "addLessonAssignment": () => `/api/LessonAssignment/assignment`,
    "lessonAssignment": (params?: any) => `/api/LessonAssignment/assignment?id=${params?.id}`,
    "deleteLessonAssignment": (params?: any) => `/api/LessonAssignment/assignment?id=${params?.id}`,
    "updateLessonAssignment": () => `/api/LessonAssignment/assignment`,
    "lessonAssignments": (params?: any) => `/api/LessonAssignment/assignments/${params?.lessonId}`,
    
    // Document
    "uploadDocument": () => `/api/Documents/upload`,
    "downloadDocument": (params?: any) => `/api/Documents/download?id=${params?.documentId}`,
    
};

export interface ApiResponse {
    status: number;
    body: any;
}

const apiRequest = async (method: Method, endpoint: string, params?: any, data?: any): Promise<ApiResponse> => {
    try {
        const url = API_ENDPOINTS[endpoint](params);
        console.log("URL:", url);

        const options: { method: Method; url: string; withCredentials: boolean; data?: any } = {
            method: method,
            url: url,
            data: data,
            withCredentials: true
        };
        const response: AxiosResponse<ApiResponse> = await axios.request({ ...options });
        return { status: response.status, body: response.data };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const axiosError = error;
            console.log("Axios Error:", axiosError);
            return { status: axiosError.response?.status || 400, body: axiosError.response?.data };
        } else {
            return { status: 400, body: "Unknown error" };
        }
    }
};

export const ApiPostRequest = async (endpoint: string, params?: any, data?: any): Promise<ApiResponse> => {
    return apiRequest("POST", endpoint, params, data);
};

export const ApiGetRequest = async (endpoint: string, params?: any): Promise<ApiResponse> => {
    return apiRequest("GET", endpoint, params);
};

export const ApiPutRequest = async (endpoint: string, params?: any, data?: any): Promise<ApiResponse> => {
    return apiRequest("PUT", endpoint, params, data);
};

export const ApiDeleteRequest = async (endpoint: string, params?: any, data?: any): Promise<ApiResponse> => {
    return apiRequest("DELETE", endpoint, params, data);
};
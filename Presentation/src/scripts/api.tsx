import axios, { AxiosResponse, Method } from 'axios';

interface ApiEndpoints {
    [key: string]: (params?: any) => string;
}

const API_ENDPOINTS: ApiEndpoints = {
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
    "teacher": (params?: any) => `/api/Teachers/teacher?id=${params?.teacherId}`,
    "deleteTeacher": (params?: any) => `/api/Teachers/teacher?id=${params?.teacherId}`,
    "updateTeacher": () => `/api/Teachers/teacher`,
    "addTeacher": () => `/api/Teachers/teacher`,

    "universities": () => `/api/Admin/universities`,
    "departments": () => `/api/Admin/departments`,
    "faculties": () => `/api/Admin/faculties`,
    "specialties": () => `/api/Admin/specialties`,
    "disciplines": () => `/api/Admin/disciplines`,
    "groups": () => `/api/Admin/groups`,

};

export interface ApiResponse {
    status: number;
    body: any;
}

const apiRequest = async (method: Method, endpoint: string, params?: any, data?: any): Promise<ApiResponse> => {
    try {
        const url = API_ENDPOINTS[endpoint](params);

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

export const ApiDeleteRequest = async (endpoint: string, params?: any): Promise<ApiResponse> => {
    return apiRequest("DELETE", endpoint, params);
};
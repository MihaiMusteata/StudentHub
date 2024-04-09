export interface Student extends StudentMinimal {
    userId: string;
    departmentId: number;
    birthDate: string;
    enrollmentDate: string;
    enrollmentNumber: string;
    financeType: string;
    facultyId: number;
    universityId: number;
    studyFrequency: string;
    specialtyId: number;
    scholarshipType: string;
    graduationDate: string;
    degreeType: string;
    year: string;
    groupId: number;
}

export interface StudentMinimal {
    id: string;
    firstName: string;
    lastName: string;
}
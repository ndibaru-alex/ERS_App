import { axiosInstance } from '../config';

interface Employment {
    employment_id?: number;
    employer_name: string;
    city_id: number;
    job_title: string;
    start_date: string;
    end_date?: string;
    contact_name?: string;
    emp_verified?: number;
}

interface EmploymentResponse extends Employment {
    city_name: string;
    region_name: string;
    state_name: string;
}

class EmploymentService {
    async create(applicantId: string, data: Employment) {
        const response = await axiosInstance.post(`/employments/applicant/${applicantId}`, data);
        return response.data;
    }

    async getByApplicant(applicantId: string): Promise<EmploymentResponse[]> {
        const response = await axiosInstance.get(`/employments/applicant/${applicantId}`);
        return response.data;
    }

    async update(employmentId: string, data: Partial<Employment>) {
        const response = await axiosInstance.put(`/employments/${employmentId}`, data);
        return response.data;
    }

    async delete(employmentId: string) {
        const response = await axiosInstance.delete(`/employments/${employmentId}`);
        return response.data;
    }

    async verify(employmentId: string) {
        const response = await axiosInstance.put(`/employments/${employmentId}/verify`);
        return response.data;
    }
}

export const employmentService = new EmploymentService();
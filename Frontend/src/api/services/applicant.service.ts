import { axiosInstance } from '../config';

interface Applicant {
    first_name: string;
    midle_name?: string;
    last_name: string;
    mother_name?: string;
    date_of_birth: string;
    place_of_birth?: string;
    gender?: string;
    email?: string;
    mobile_number: string;
    national_id_number?: string;
    passport_number?: string;
    city_id: number;
    photo_url?: string;
    marital_status?: string;
    highest_educ?: string;
    school_name?: string;
    nbr_of_chil?: number;
    live_with?: string;
    emp_status?: string;
    app_status?: string;
    is_verified?: boolean;
    height?: number;
    weight?: number;
}

class ApplicantService {
    async create(data: Applicant) {
        const response = await axiosInstance.post('/applicants', data);
        return response.data;
    }

    async getById(id: string) {
        const response = await axiosInstance.get(`/applicants/${id}`);
        return response.data;
    }

    async findByMobile(mobileNumber: string) {
        try {
            // Use the secure OTP request endpoint instead of direct search
            const response = await axiosInstance.post('/applicants/mobile/request', { mobile_number: mobileNumber });
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }

    async update(id: string, data: Partial<Applicant>) {
        const response = await axiosInstance.put(`/applicants/${id}`, data);
        return response.data;
    }

    async verify(id: string) {
        const response = await axiosInstance.put(`/applicants/${id}/verify`);
        return response.data;
    }

    async getAll() {
        const response = await axiosInstance.get('/applicants');
        return response.data;
    }

    async delete(id: string) {
        const response = await axiosInstance.delete(`/applicants/${id}`);
        return response.data;
    }

    async requestMobileSearch(mobile_number: string) {
        // Basic mobile number validation
        if (!/^\d{10}$/.test(mobile_number)) {
            throw new Error('Please enter a valid 10-digit mobile number');
        }

        const response = await axiosInstance.post('/applicants/mobile/request', { mobile_number });
        return response.data;
    }

    async verifyAndSearch(mobile_number: string, otp: string) {
        // Validate OTP format
        if (!/^\d{6}$/.test(otp)) {
            throw new Error('Please enter a valid 6-digit OTP');
        }

        const response = await axiosInstance.post('/applicants/mobile/verify', { mobile_number, otp });
        return response.data;
    }

    async updateViaMobile(id: string, data: Partial<Applicant>) {
        const response = await axiosInstance.put(`/applicants/mobile/update/${id}`, data);
        return response.data;
    }
}

export const applicantService = new ApplicantService();
import { axiosInstance } from '../config';

export type MPType = 'federal' | 'state';

export interface MP {
    mp_id?: number;
    applicant_id: string;
    mp_name: string;
    mobile?: string;
    state_id: number;
    mp_type: MPType;
}

class MPService {
    async create(data: Omit<MP, 'mp_id'>) {
        const response = await axiosInstance.post('/mps', data);
        return response.data;
    }

    async getByApplicant(applicantId: string) {
        try {
            console.log('Fetching MPs for applicant ID:', applicantId);
            const response = await axiosInstance.get(`/mps/applicant/${applicantId}`);
            console.log('MPs fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching MPs for applicant ID:', applicantId, error);
            throw error;
        }
    }

    async update(id: number, data: Partial<MP>) {
        const response = await axiosInstance.put(`/mps/${id}`, data);
        return response.data;
    }

    async delete(id: number) {
        const response = await axiosInstance.delete(`/mps/${id}`);
        return response.data;
    }

    async getAll() {
        const response = await axiosInstance.get('/mps');
        return response.data;
    }
}

export const mpService = new MPService();
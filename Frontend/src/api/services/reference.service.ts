import { axiosInstance } from '../config';

interface Reference {
    applicant_id: string;
    full_name: string;
    ref_relationship: string;
    is_grantor: string;
    city_id: number;
    mobile_number?: string;
    national_id_number?: string;
    passport_number?: string;
}

interface ReferenceResponse extends Reference {
    applic_ref_id: string;
    city_name: string;
    region_name: string;
    state_name: string;
    ref_verified: string;
}

class ReferenceService {
    async create(data: Reference) {
        // Ensure data is properly formatted before sending
        const formattedData = {
            ...data,
            city_id: Number(data.city_id),
            is_grantor: data.is_grantor || '0',
            ref_verified: '0'
        };
        const response = await axiosInstance.post('/references', formattedData);
        return response.data;
    }

    async getByApplicant(applicantId: string): Promise<ReferenceResponse[]> {
        const response = await axiosInstance.get(`/references/applicant/${applicantId}`);
        return response.data;
    }

    async update(referenceId: string, data: Partial<Reference>) {
        const response = await axiosInstance.put(`/references/${referenceId}`, data);
        return response.data;
    }

    async delete(referenceId: string) {
        const response = await axiosInstance.delete(`/references/${referenceId}`);
        return response.data;
    }

    async verify(referenceId: string) {
        const response = await axiosInstance.put(`/references/${referenceId}/verify`, {});
        return response.data;
    }
}

export const referenceService = new ReferenceService();
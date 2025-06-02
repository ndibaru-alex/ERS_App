import { axiosInstance } from '../config';

export type LanguageLevel = 'Non' | 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';

export interface Language {
    app_lan_id?: number;
    applicant_id: string;
    language: string;
    level: LanguageLevel;
}

class LanguageService {
    async create(data: Omit<Language, 'app_lan_id'>) {
        try {
            const response = await axiosInstance.post('/languages', data);
            return response.data;
        } catch (error) {
            console.error('Error in language service (create):', error);
            throw error;
        }
    }

    async getByApplicant(applicantId: string) {
        try {
            const response = await axiosInstance.get(`/languages/applicant/${applicantId}`);
            return response.data;
        } catch (error) {
            console.error('Error in language service (getByApplicant):', error);
            throw error;
        }
    }

    async update(id: number, data: Partial<Language>) {
        try {
            const response = await axiosInstance.put(`/languages/${id}`, data);
            return response.data;
        } catch (error) {
            console.error('Error in language service (update):', error);
            throw error;
        }
    }

    async delete(id: number) {
        try {
            const response = await axiosInstance.delete(`/languages/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error in language service (delete):', error);
            throw error;
        }
    }
}

export const languageService = new LanguageService();
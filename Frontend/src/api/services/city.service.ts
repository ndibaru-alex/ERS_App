import { axiosInstance } from '../config';

interface City {
    city_id: number;
    region_id: number;
    state_id: number;
    city_name: string;
}

class CityService {
    async getAll() {
        const response = await axiosInstance.get('/cities');
        return response.data;
    }

    async getById(id: number | string) {
        const response = await axiosInstance.get(`/cities/${id}`);
        return response.data;
    }

    async getByRegion(regionId: string) {
        const response = await axiosInstance.get(`/cities/region/${regionId}`);
        return response.data;
    }

    async create(data: Omit<City, 'city_id'>) {
        const response = await axiosInstance.post('/cities', data);
        return response.data;
    }

    async update(id: number, data: Partial<City>) {
        const response = await axiosInstance.put(`/cities/${id}`, data);
        return response.data;
    }

    async delete(id: number) {
        const response = await axiosInstance.delete(`/cities/${id}`);
        return response.data;
    }
}

export const cityService = new CityService();
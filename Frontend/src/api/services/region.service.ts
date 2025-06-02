import { axiosInstance } from '../config';

const getAll = async () => {
    const response = await axiosInstance.get('/regions');
    return response.data;
};

const getById = async (id: string) => {
    const response = await axiosInstance.get(`/regions/${id}`);
    return response.data;
};

const getByState = async (stateId: string) => {
    const response = await axiosInstance.get(`/regions/state/${stateId}`);
    return response.data;
};

const create = async (data: any) => {
    const response = await axiosInstance.post('/regions', data);
    return response.data;
};

const update = async (id: string, data: any) => {
    const response = await axiosInstance.put(`/regions/${id}`, data);
    return response.data;
};

const remove = async (id: string) => {
    const response = await axiosInstance.delete(`/regions/${id}`);
    return response.data;
};

export const regionService = {
    getAll,
    getById,
    getByState,
    create,
    update,
    delete: remove
};
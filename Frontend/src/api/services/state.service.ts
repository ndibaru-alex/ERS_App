import { axiosInstance } from '../config';

interface State {
  id: string;
  state_name: string;
}

export const stateService = {
  getAll: async (): Promise<State[]> => {
    try {
      console.log('Fetching all states');
      const response = await axiosInstance.get('/states');
      console.log('States API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching states:', error.response?.data || error.message);
      throw error;
    }
  },

  getById: async (id: string): Promise<State> => {
    try {
      console.log('Fetching state by ID:', id);
      const response = await axiosInstance.get(`/states/${id}`);
      console.log('State fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching state:', error.response?.data || error.message);
      throw error;
    }
  },

  create: async (data: { name: string }): Promise<State> => {
    try {
      console.log('Creating state with data:', data);
      const response = await axiosInstance.post('/states', {
        state_name: data.name
      });
      console.log('State created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating state:', {
        data,
        error: error.response?.data || error.message
      });
      throw error;
    }
  },

  update: async (id: string, data: { name: string }): Promise<State> => {
    try {
      console.log('Updating state:', { id, data });
      const response = await axiosInstance.put(`/states/${id}`, {
        state_name: data.name
      });
      console.log('State updated:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating state:', {
        id,
        data,
        error: error.response?.data || error.message
      });
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      console.log('Deleting state:', id);
      const response = await axiosInstance.delete(`/states/${id}`);
      console.log('State deleted:', response.data);
    } catch (error: any) {
      console.error('Error deleting state:', {
        id,
        error: error.response?.data || error.message
      });
      throw error;
    }
  },
};
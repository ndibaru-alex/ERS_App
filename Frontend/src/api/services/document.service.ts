import { axiosInstance } from '../config';

interface Document {
    applicant_id: string;
    document_type: string;
    file_url: string;
    status: string;
    doc_verified: string;
    remarks?: string;
    uploaded_at: string;
    updated_at: string;
}

const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosInstance.post('/documents/upload/file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const uploadDocument = async (applicant_id: string, file: File, data: Document) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('applicant_id', applicant_id);
    formData.append('document_type', data.document_type);
    if (data.remarks) {
        formData.append('remarks', data.remarks);
    }
    
    const response = await axiosInstance.post('/documents/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const getApplicantDocuments = async (applicant_id: string) => {
    const response = await axiosInstance.get(`/documents/applicant/${applicant_id}`);
    return response.data;
};

const updateStatus = async (document_id: string, status: string, remarks?: string) => {
    const response = await axiosInstance.put(`/documents/${document_id}/status`, {
        status,
        remarks
    });
    return response.data;
};

const verify = async (document_id: string, remarks?: string) => {
    const response = await axiosInstance.put(`/documents/${document_id}/verify`, { remarks });
    return response.data;
};

const remove = async (document_id: string) => {
    const response = await axiosInstance.delete(`/documents/${document_id}`);
    return response.data;
};

export const documentService = {
    uploadFile,
    uploadDocument,
    getApplicantDocuments,
    updateStatus,
    verify,
    delete: remove
};
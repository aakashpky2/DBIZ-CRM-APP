import api from '../api/axios';

const gstr1Service = {
  getGstr1Counts: async (trn) => {
    try {
      const response = await api.get(`/gstr1/counts/${trn}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching GSTR-1 counts:', error);
      throw error;
    }
  },

  getGstr1Records: async (tableName, trn) => {
    try {
      const response = await api.get(`/gstr1/records/${tableName}/${trn}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching records for ${tableName}:`, error);
      throw error;
    }
  },

  saveGstr1Record: async (tableName, payload) => {
    try {
      console.log('Saving record payload:', payload);
      const response = await api.post(`/gstr1/records/${tableName}`, payload);
      return response.data;
    } catch (error) {
      console.error('Error saving record to', tableName, ':', error?.response?.data || error.message);
      throw error;
    }
  },

  deleteGstr1Record: async (tableName, id) => {
    try {
      const response = await api.delete(`/gstr1/records/${tableName}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting record from ${tableName}:`, error);
      throw error;
    }
  },

  resetGstr1Data: async (trn) => {
    try {
      const response = await api.delete(`/gstr1/reset/${trn}`);
      return response.data;
    } catch (error) {
      console.error(`Error resetting GSTR-1 data for TRN ${trn}:`, error);
      throw error;
    }
  }
};

export default gstr1Service;

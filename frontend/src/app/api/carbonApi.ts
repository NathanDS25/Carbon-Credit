import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const verifyAndMintCredits = async (payload: { ngoWallet: string; landAreaHectares: number }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/carbon/mint`, payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: "Failed to connect to the backend server." };
  }
};

export const uploadImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axios.post(`${API_BASE_URL}/carbon/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: "Failed to upload image." };
  }
};

export const fetchTradingData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/carbon/trading-data`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: "Failed to fetch trading data." };
  }
};

export const triggerAction = async (actionType: string, payload: any = {}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/carbon/action`, { actionType, payload });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: `Failed to execute ${actionType} action.` };
  }
};

export const fetchNGOs = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/carbon/ngos`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: "Failed to fetch NGOs." };
  }
};

export const fetchCompanies = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/carbon/companies`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: "Failed to fetch companies." };
  }
};

export const fetchCreditRequests = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/carbon/requests`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: "Failed to fetch credit requests." };
  }
};

export const submitCreditRequest = async (payload: { companyName: string; creditsNeeded: number; purpose: string; deadline: string }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/carbon/requests`, payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: "Failed to submit credit request." };
  }
};

export const fetchRegionalPrices = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/carbon/regional-prices`);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { error: "Failed to fetch regional prices." };
  }
};

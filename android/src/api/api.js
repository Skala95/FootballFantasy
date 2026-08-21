import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:5000/api';

const request = async (method, endpoint, data = null) => {
    const token = await AsyncStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    try {
        const response = await axios({
            method,
            url: `${BASE_URL}${endpoint}`,
            ...(data !== null ? { data } : {}),
            headers
        });
        return response.data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
};

export default request;

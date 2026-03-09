import axios from 'axios';

// Single axios instance shared across all API modules.
// Setting baseURL here means every call only needs to specify the path, e.g. "/products".
const http = axios.create({
  baseURL: 'https://fakestoreapi.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default http;

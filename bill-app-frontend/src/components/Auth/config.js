/*const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://bill-app-backend-production.up.railway.app/api"
    : "http://localhost:5000/api";

export default API_BASE_URL;*/

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export default BASE_URL;


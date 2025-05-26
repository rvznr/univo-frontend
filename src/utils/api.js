// src/utils/api.js

const API_URL = process.env.REACT_APP_API_URL;

export async function apiRequest(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error("Kullanıcı doğrulanmamış! Token bulunamadı.");
  }

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include'
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json();
    console.error(`API Error [${response.status}]:`, errorData);
    throw new Error(errorData.message || "API isteği başarısız.");
  }

  return await response.json();
}

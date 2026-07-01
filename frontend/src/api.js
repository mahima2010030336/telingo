import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
}

export const wordsAPI = {
  getAll: (params) => api.get('/api/words', { params }),
  getOne: (id) => api.get(`/api/words/${id}`),
  create: (data) => api.post('/api/words', data),
  addDefinition: (wordId, data) => api.post(`/api/words/${wordId}/definitions`, data),
}

export const voteAPI = {
  voteWord: (wordId, voteType) => api.post(`/api/vote/word/${wordId}`, { vote_type: voteType }),
  voteDefinition: (defId, voteType) => api.post(`/api/vote/definition/${defId}`, { vote_type: voteType }),
}

export const flagAPI = {
  flagWord: (wordId) => api.post(`/api/flag/word/${wordId}`),
  flagDefinition: (defId) => api.post(`/api/flag/definition/${defId}`),
}

export const seedAPI = {
  seed: () => api.post('/api/seed'),
}

export default api

import api from "./apiClient"
import apimock from "./apimock"

const useMock = import.meta.env.VITE_USE_MOCK === "true"

const apiReal = {
  getAll: async () => {
    const res = await api.get("/blueprints")
    return res.data?.data || []
  },

  getByAuthor: async (author) => {
    const res = await api.get(`/blueprints/${author}`)
    return res.data?.data || []
  },

  getByAuthorAndName: async (author, name) => {
    const res = await api.get(`/blueprints/${author}/${name}`)
    return res.data?.data || null
  },

  create: async (blueprint) => {
    const res = await api.post("/blueprints", blueprint)
    return res.data?.data
  },

  delete: async (author, name) => {
    const res = await api.delete(`/blueprints/${author}/${name}`)
    return res.data?.data
  }
}

const service = useMock ? apimock : apiReal

export default service
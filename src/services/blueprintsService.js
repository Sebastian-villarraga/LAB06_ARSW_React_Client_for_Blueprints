import api from "./apiClient"
import apimock from "./apimock"

const useMock = import.meta.env.VITE_USE_MOCK === "true"

const apiReal = {
  getAll: async () => {
    const res = await api.get("/blueprints")
    return res.data
  },

  getByAuthor: async (author) => {
    const res = await api.get(`/blueprints/${author}`)
    return res.data
  },

  getByAuthorAndName: async (author, name) => {
    const res = await api.get(`/blueprints/${author}/${name}`)
    return res.data
  },

  create: async (blueprint) => {
    const res = await api.post("/blueprints", blueprint)
    return res.data
  }
}

const service = useMock ? apimock : apiReal

export default service
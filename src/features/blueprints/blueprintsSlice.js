import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintsService.js'

export const fetchAuthors = createAsyncThunk(
  'blueprints/fetchAuthors',
  async () => {
    const data = await blueprintsService.getAll()
    const authors = [...new Set(data.map((bp) => bp.author))]
    return authors
  }
)

export const fetchByAuthor = createAsyncThunk(
  'blueprints/fetchByAuthor',
  async (author) => {
    const data = await blueprintsService.getByAuthor(author)
    return { author, items: data }
  }
)

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => {
    const data = await blueprintsService.getByAuthorAndName(author, name)
    return data
  }
)

export const createBlueprint = createAsyncThunk(
  'blueprints/createBlueprint',
  async (payload) => {
    const data = await blueprintsService.create(payload)
    return data
  }
)

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder

      // ---------------- FETCH AUTHORS ----------------
      .addCase(fetchAuthors.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.loading = false
        state.authors = action.payload
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      // ---------------- FETCH BY AUTHOR ----------------
      .addCase(fetchByAuthor.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchByAuthor.fulfilled, (state, action) => {
        state.loading = false
        state.byAuthor[action.payload.author] = action.payload.items
      })
      .addCase(fetchByAuthor.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      // ---------------- FETCH BLUEPRINT ----------------
      .addCase(fetchBlueprint.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBlueprint.fulfilled, (state, action) => {
        state.loading = false
        state.current = action.payload
      })
      .addCase(fetchBlueprint.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })

      // ---------------- CREATE BLUEPRINT ----------------
      .addCase(createBlueprint.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBlueprint.fulfilled, (state, action) => {
        state.loading = false
        const bp = action.payload

        if (!state.byAuthor[bp.author]) {
          state.byAuthor[bp.author] = []
        }

        state.byAuthor[bp.author].push(bp)
      })
      .addCase(createBlueprint.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { clearError } = slice.actions

export default slice.reducer
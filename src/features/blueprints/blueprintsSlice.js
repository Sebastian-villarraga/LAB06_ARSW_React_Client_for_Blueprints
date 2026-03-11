import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintsService.js'

export const fetchAuthors = createAsyncThunk(
  'blueprints/fetchAuthors',
  async () => {
    const data = await blueprintsService.getAll()
    const authors = [...new Set(data.map((bp) => bp.author))]
    return authors
  },
)

export const fetchByAuthor = createAsyncThunk(
  'blueprints/fetchByAuthor',
  async (author) => {
    const data = await blueprintsService.getByAuthor(author)
    return { author, items: data }
  },
)

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => {
    const data = await blueprintsService.getByAuthorAndName(author, name)
    return data
  },
)

export const createBlueprint = createAsyncThunk(
  'blueprints/createBlueprint',
  async (payload) => {
    const data = await blueprintsService.create(payload)
    return data
  },
)

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    authors: [],
    byAuthor: {},
    current: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuthors.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchAuthors.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.authors = action.payload
      })
      .addCase(fetchAuthors.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
      .addCase(fetchByAuthor.fulfilled, (state, action) => {
        state.byAuthor[action.payload.author] = action.payload.items
      })
      .addCase(fetchBlueprint.fulfilled, (state, action) => {
        state.current = action.payload
      })
      .addCase(createBlueprint.fulfilled, (state, action) => {
        const bp = action.payload
        if (state.byAuthor[bp.author]) {
          state.byAuthor[bp.author].push(bp)
        }
      })
  },
})

export default slice.reducer
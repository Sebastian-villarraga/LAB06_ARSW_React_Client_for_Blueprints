import { createAsyncThunk, createSlice, createSelector } from '@reduxjs/toolkit'
import blueprintsService from '../../services/blueprintsService.js'

export const fetchAllBlueprints = createAsyncThunk(
  'blueprints/fetchAll',
  async () => {
    return await blueprintsService.getAll()
  }
)

export const fetchByAuthor = createAsyncThunk(
  'blueprints/fetchByAuthor',
  async (author) => {
    return await blueprintsService.getByAuthor(author)
  }
)

export const fetchBlueprint = createAsyncThunk(
  'blueprints/fetchBlueprint',
  async ({ author, name }) => {
    return await blueprintsService.getByAuthorAndName(author, name)
  }
)

const slice = createSlice({
  name: 'blueprints',
  initialState: {
    allItems: [],
    searchResults: [],
    current: null,
    listStatus: 'idle',
    listError: null,
    detailStatus: 'idle',
    detailError: null,
  },
  reducers: {
    showAllInTable: (state) => {
      state.searchResults = state.allItems;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllBlueprints.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(fetchAllBlueprints.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.allItems = action.payload
      })
      .addCase(fetchAllBlueprints.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.error.message || 'Error al obtener planos'
      })

      .addCase(fetchByAuthor.pending, (state) => {
        state.listStatus = 'loading'
        state.listError = null
      })
      .addCase(fetchByAuthor.fulfilled, (state, action) => {
        state.listStatus = 'succeeded'
        state.searchResults = action.payload 
      })
      .addCase(fetchByAuthor.rejected, (state, action) => {
        state.listStatus = 'failed'
        state.listError = action.error.message || 'Error al buscar por autor'
      })

      .addCase(fetchBlueprint.pending, (state) => {
        state.detailStatus = 'loading'
        state.detailError = null
      })
      .addCase(fetchBlueprint.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded'
        state.current = action.payload
      })
      .addCase(fetchBlueprint.rejected, (state, action) => {
        state.detailStatus = 'failed'
        state.detailError = action.error.message || 'Error al cargar el detalle'
      })
  },
})

export const { showAllInTable } = slice.actions;

const selectAllItems = (state) => state.blueprints.allItems;
export const selectTop5Blueprints = createSelector(
  [selectAllItems],
  (items) => {
    return [...items]
      .sort((a, b) => (b.points?.length || 0) - (a.points?.length || 0))
      .slice(0, 5)
  }
)

export default slice.reducer
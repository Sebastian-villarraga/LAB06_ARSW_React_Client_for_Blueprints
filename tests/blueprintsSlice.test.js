import reducer, { clearError } from '../features/blueprints/blueprintsSlice'

describe('blueprintsSlice reducer', () => {

  const initialState = {
    authors: [],
    byAuthor: {},
    current: null,
    loading: false,
    error: null
  }

  test('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState)
  })

  test('should clear error', () => {

    const stateWithError = {
      ...initialState,
      error: "Network error"
    }

    const newState = reducer(stateWithError, clearError())

    expect(newState.error).toBe(null)
  })

})
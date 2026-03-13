import { createSelector } from '@reduxjs/toolkit'

const selectBlueprintState = (state) => state.blueprints

export const selectBlueprintsByAuthor = createSelector(
  [selectBlueprintState],
  (blueprints) => blueprints.byAuthor
)

export const selectAllBlueprints = createSelector(
  [selectBlueprintsByAuthor],
  (byAuthor) => {
    return Object.values(byAuthor).flat()
  }
)

export const selectTopBlueprints = createSelector(
  [selectAllBlueprints],
  (blueprints) => {
    return [...blueprints]
      .sort((a, b) => b.points.length - a.points.length)
      .slice(0, 5)
  }
)
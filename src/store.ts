import { createStore, createTypedHooks } from 'easy-peasy';

import { gameReducer, GameModel } from './modules/game';

// "rootReducer" interface, gather all module types here
export interface StoreModel {
  game: GameModel;
}
// create the actual root redux model (rootReducer)
// and feed it to the createStore
const model: StoreModel = {
  game: gameReducer,
};

// Typed hooks for the function components
export const { useStoreActions, useStoreDispatch, useStoreState } = createTypedHooks<StoreModel>();

export const store = createStore(model);

import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'

import { appReducer } from './reducer'
// import { appSaga } from './saga'

export const appStore = () => {
  const store = createStore(
    appReducer,
    applyMiddleware()
  )

//  const sagaMiddleware = createSagaMiddleware()
//  sagaMiddleware.run(appSaga)

  return store
}
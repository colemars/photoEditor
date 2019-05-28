import {
  UPDATE_LAST_XCORD,
  UPDATE_LAST_YCORD,
  UPDATE_PCT,
  UPDATE_ZOOM_VALUE
} from "../constants/action-types";

const initialState = {
  defaultX: null,
  defaultY: null,
  lastX: 0,
  lastY: 0,
  pct: 0,
  currentZoomValue: 0
};

function rootReducer(state = initialState, action) {
  if (action.type === UPDATE_LAST_XCORD) {
    return { ...state, lastX: action.payload };
  }
  if (action.type === UPDATE_LAST_YCORD) {
    return { ...state, lastY: action.payload };
  }
  if (action.type === UPDATE_PCT) {
    return { ...state, pct: action.payload };
  }
  if (action.type === UPDATE_ZOOM_VALUE) {
    return { ...state, currentZoomValue: action.payload };
  }
  return state;
}

export default rootReducer;

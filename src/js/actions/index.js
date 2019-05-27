import { UPDATE_LAST_XCORD } from '../constants/action-types';
import { UPDATE_LAST_YCORD } from '../constants/action-types';
import { UPDATE_PCT } from '../constants/action-types';
import { UPDATE_ZOOM_VALUE } from '../constants/action-types';

export function updateLastXCord(payload) {
  return { type: UPDATE_LAST_XCORD, payload };
}

export function updateLastYCord(payload) {
  return { type: UPDATE_LAST_YCORD, payload };
}

export function updatePct(payload) {
  return { type: UPDATE_PCT, payload };
}

export function updateZoomValue(payload) {
  return { type: UPDATE_ZOOM_VALUE, payload };
}
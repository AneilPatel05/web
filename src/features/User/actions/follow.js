import { put, select, takeLatest } from 'redux-saga/effects';
import update from 'immutability-helper';
import { notification } from 'antd';
import { selectMe } from '../selectors';
import steemConnectAPI from 'utils/steemConnectAPI';
import { extractErrorMessage } from 'utils/errorMessage';

/*--------- CONSTANTS ---------*/
const FOLLOW_BEGIN = 'FOLLOW_BEGIN';
const FOLLOW_INIT = 'FOLLOW_INIT';
const FOLLOW_SUCCESS = 'FOLLOW_SUCCESS';
const FOLLOW_FAILURE = 'FOLLOW_FAILURE';

/*--------- ACTIONS ---------*/
export function followBegin(accountName) {
  return { type: FOLLOW_BEGIN, accountName };
}

export function followInit(me, accountName) {
  return { type: FOLLOW_INIT, me, accountName };
}

export function followSuccess(me, accountName) {
  return { type: FOLLOW_SUCCESS, me, accountName };
}

export function followFailure(message) {
  return { type: FOLLOW_FAILURE, message };
}

/*--------- REDUCER ---------*/
export function followReducer(state, action) {
  switch (action.type) {
    case FOLLOW_INIT: {
      const {me, accountName } = action;
      return update(state, {
        followings: {
          [me]: {
            loadStatus: {$auto: {
              [accountName]: {$set: true},
            }},
          }
        }
      });
    }
    case FOLLOW_SUCCESS: {
      const { me, accountName } = action;
      return update(state, {
        followings: {
          [me]: {
            list: {$push: [{
              follower: me,
              following: accountName,
            }]},
            loadStatus: {
              [accountName]: {$set: false},
            }
          }
        }
      });
    }
    default:
      return state;
  }
}

/*--------- SAGAS ---------*/
function* follow({ accountName }) {
  try {
    const me = yield select(selectMe());
    yield put(followInit(me, accountName));
    yield steemConnectAPI.follow(me, accountName);
    yield put(followSuccess(me, accountName));
    yield notification['success']({ message: `You are now following ${accountName}.` });
  } catch (e) {
    yield notification['error']({ message: extractErrorMessage(e) });
    yield put(followFailure(e.message));
  }
}

export default function* followManager() {
  yield takeLatest(FOLLOW_BEGIN, follow);
}

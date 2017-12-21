import { put, takeEvery } from 'redux-saga/effects';
import steem from 'steem';
import update from 'immutability-helper';

/*--------- CONSTANTS ---------*/
const GET_VOTE_HISTORY_BEGIN = 'GET_VOTE_HISTORY_BEGIN';
const GET_VOTE_HISTORY_SUCCESS = 'GET_VOTE_HISTORY_SUCCESS';
const GET_VOTE_HISTORY_FAILURE = 'GET_VOTE_HISTORY_FAILURE';

/*--------- ACTIONS ---------*/
export function getVoteHistoryBegin(accountName) {
  return { type: GET_VOTE_HISTORY_BEGIN, accountName };
}

export function getVoteHistorySuccess(accountName, votes) {
  return { type: GET_VOTE_HISTORY_SUCCESS, accountName, votes };
}

export function getVoteHistoryFailure(message) {
  return { type: GET_VOTE_HISTORY_FAILURE, message };
}

/*--------- REDUCER ---------*/
export function getVoteHistoryReducer(state, action) {
  switch (action.type) {
    case GET_VOTE_HISTORY_SUCCESS: {
      const { accountName, votes } = action;
      return update(state, {
        accounts: {
          [accountName]: {$auto: {
            votes: {$autoArray: {
              $push: votes,
            }},
          }},
        },
      });
    }
    default:
      return state;
  }
}

/*--------- SAGAS ---------*/
function* getVoteHistory({ accountName }) {
  try {
    const votes = yield steem.api.getAccountVotesAsync(accountName);
    yield put(getVoteHistorySuccess(accountName, votes));
  } catch(e) {
    yield put(getVoteHistoryFailure(e.message));
  }
}

export default function* getVoteHistoryManager() {
  yield takeEvery(GET_VOTE_HISTORY_BEGIN, getVoteHistory);
}

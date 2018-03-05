import { put, select, takeLatest } from 'redux-saga/effects';
import update from 'immutability-helper';
import { notification } from 'antd';
import { createCommentPermlink } from 'utils/helpers/steemitHelpers';
import { selectMyAccount } from 'features/User/selectors';
import { toCustomISOString } from'utils/date';
import steemConnectAPI from 'utils/steemConnectAPI';

/*--------- CONSTANTS ---------*/
const REPLY_BEGIN = 'REPLY_BEGIN';
const REPLY_OPTIMISTIC = 'REPLY_OPTIMISTIC';
const REPLY_SUCCESS = 'REPLY_SUCCESS';
const REPLY_FAILURE = 'REPLY_FAILURE';
const ADD_COMMENTS_FROM_POST = 'ADD_COMMENTS_FROM_POST';

/*--------- ACTIONS ---------*/
export function replyBegin(parent, body) {
  return { type: REPLY_BEGIN, parent, body };
}

function replyOptimistic(parent, tempId, replyObj) {
  return { type: REPLY_OPTIMISTIC, parent, tempId, replyObj };
}

function replySuccess() {
  return { type: REPLY_SUCCESS };
}

function replyFailure(message) {
  return { type: REPLY_FAILURE, message };
}

function addCommentsFromPosts(parent, tempId) {
  return { type: ADD_COMMENTS_FROM_POST, parent, tempId };
}

/*--------- REDUCER ---------*/
export function replyReducer(state, action) {
  switch (action.type) {
    case REPLY_BEGIN: {
      return update(state, {
        isPublishing: { $set: true },
      });
    }
    case REPLY_OPTIMISTIC: {
      const { parent, tempId, replyObj } = action;
      return update(state, {
        commentsData: {
          [tempId]: { $set: replyObj },
        },
        commentsChild: {
          [parent.id]: { $autoArray: { $push: [tempId] } },
        },
      });
    }
    case ADD_COMMENTS_FROM_POST: {
      const { parent, tempId } = action;
      return update(state, {
        commentsFromPost: {
          [`${parent.author}/${parent.permlink}`]: {
            list: { $push: [tempId] }
          },
        }
      });
    }
    case REPLY_SUCCESS: {
      return update(state, {
        isPublishing: { $set: false },
        hasSucceeded: { $set: true },
      });
    }
    case REPLY_FAILURE: {
      return update(state, {
        isPublishing: { $set: false },
      });
    }
    default:
      return state;
  }
}

/*--------- SAGAS ---------*/
function* reply({ parent, body }) {
  try {
    const myAccount = yield select(selectMyAccount());
    const permlink = createCommentPermlink(parent.author, parent.permlink);
    const json_metadata = { tags: [ parent.category || (parent.tags && parent.tags[0]) ] };
    const now = toCustomISOString(new Date());
    const cashoutTime = toCustomISOString(new Date(Date.now() + 604800));
    const tempId = Math.floor((Math.random() * 1000000) + 1);

    const replyObj = {
      id: tempId,
      author: myAccount.name,
      parent_author: parent.author,
      permlink,
      body,
      json_metadata,
      created: now,
      last_update: now,
      active_votes: [],
      cashout_time: cashoutTime,
      net_votes: 0,
      author_reputation: myAccount.reputation,
    };

    yield put(replyOptimistic(parent, tempId, replyObj));

    // IF PARENT IS A POST
    if (!parent.parent_author) {
      yield put(addCommentsFromPosts(parent, tempId));
    }

    yield steemConnectAPI.comment(
      parent.author,
      parent.permlink,
      myAccount.name,
      permlink,
      '',
      body,
      { tags: [ parent.category || (parent.tags && parent.tags[0]) ] },
    );
    yield put(replySuccess());

    // TODO: Update cache using `api.refreshPost`
    // TODO: Update children counter on posts
  } catch (e) {
    yield notification['error']({ message: e.message });
    yield put(replyFailure(e.message));
  }
}

export default function* replyManager() {
  yield takeLatest(REPLY_BEGIN, reply);
}

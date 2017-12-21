import combine from 'utils/combine';
/*
 * EXPORTING REDUCERS and SAGAS
 */
import getCommentsFromPost, { getCommentsFromPostReducer } from './actions/getCommentsFromPost';
import getCommentsFromUser, { getCommentsFromUserReducer } from './actions/getCommentsFromUser';
import getRepliesToUser, { getRepliesToUserReducer } from './actions/getRepliesToUser';
import reply, { replyReducer } from './actions/reply';
import commentsReducer from './reducer';

export const initialState = {
  commentsChild: {},
  commentsData: {},
  commentsFromPost: {},
  commentsFromUser: {},
  repliesToUser: {},
  isLoading: false,
};

export const reducer = (state = initialState, action) => combine(
  [
    getCommentsFromPostReducer,
    getRepliesToUserReducer,
    getCommentsFromUserReducer,
    commentsReducer,
    replyReducer,
  ],
  state,
  action,
);

// All sagas to be loaded
export default [
  getCommentsFromPost,
  getCommentsFromUser,
  getRepliesToUser,
  reply,
];

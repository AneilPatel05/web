import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import titleWrapper from 'titleWrapper';

import InfiniteList from 'components/InfiniteList';
import Reward from './components/Reward';
import { selectHistoryTransfer, selectRewardsAuthor } from './selectors';
import { getTransferHistoryBegin } from './actions/getTransferHistory';

function ProfileRewardsAuthor(props) {
  const { getTransferHistory, historyTransfer: { hasMore, isLoading }, rewardsAuthor } = props;
  return (
    <div>
      <div className="tab__filter">
        <h3 className="tab__filter__text">
          Author Rewards History
        </h3>
      </div>
      <div className="tab__result">
        <InfiniteList
          list={rewardsAuthor}
          hasMore={hasMore}
          isLoading={isLoading}
          initLoad={getTransferHistory}
          loadMoreCb={getTransferHistory}
          itemMappingCb={(reward, index) => (
            <Reward key={index} reward={reward} type="author" />
          )}
        />
      </div>
    </div>
  );
}

ProfileRewardsAuthor.propTypes = {
  historyTransfer: PropTypes.object.isRequired,
  rewardsAuthor: PropTypes.array.isRequired,
};

const mapStateToProps = (state, props) => createStructuredSelector({
  historyTransfer: selectHistoryTransfer(props.match.params.accountName),
  rewardsAuthor: selectRewardsAuthor(props.match.params.accountName),
});

const mapDispatchToProps = (dispatch, props) => ({
  getTransferHistory: () => dispatch(getTransferHistoryBegin(props.match.params.accountName)),
});

export default connect(mapStateToProps, mapDispatchToProps)(titleWrapper(ProfileRewardsAuthor, 'Rewards Author'));

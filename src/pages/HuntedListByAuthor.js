import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { Spin, Select } from 'antd';
import InfiniteScroll from 'components/InfiniteScroll';
import { selectCurrentUser } from 'features/User/selectors';
import { selectAuthorStatus, selectAuthorPosts, selectPosts } from 'features/Post/selectors';
import { getPostsByAuthorBegin } from 'features/Post/actions/getPostsByAuthor';
import { setCurrentUserBegin } from 'features/User/actions/setCurrentUser';
import PostItem from 'features/Post/components/PostItem';
import { formatAmount } from "utils/helpers/steemitHelpers";
import { getSortOption, setSortOption } from 'utils/sortOptions';

class HuntedListByAuthor extends Component {
  static propTypes = {
    currentUser: PropTypes.string,
    lauthorStatus: PropTypes.object.isRequired,
    posts: PropTypes.object.isRequired,
    authorPosts: PropTypes.object.isRequired,
    getPostsByAuthor: PropTypes.func.isRequired,
    setCurrentUser: PropTypes.func.isRequired,
  };

  componentDidMount() {
    const { match } = this.props;

    if (match.params.author !== this.props.currentUser) {
      this.props.setCurrentUser(match.params.author);
      this.props.getPostsByAuthor(match.params.author, 1);
    }
    // scrollTop();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.author !== nextProps.currentUser) {
      this.props.setCurrentUser(nextProps.match.params.author);
      this.props.getPostsByAuthor(nextProps.match.params.author, 1);
      // scrollTop();
    }
  }

  loadMore = (nextPage) => {
    this.props.getPostsByAuthor(this.props.currentUser, nextPage);
  };

  handleSortOption = (value) => {
    setSortOption('profile', value);
    window.location.reload();
  };

  render() {
    const { lauthorStatus, currentUser, authorPosts, posts } = this.props;

    const items = (authorPosts[currentUser] || []).map((key, index) =>
      <PostItem key={index + 1} rank={index + 1} post={posts[key]} />
    )

    let hasMore = true;
    let isLoading = false;
    if (lauthorStatus[currentUser]) {
      if (lauthorStatus[currentUser]['finished']) {
        hasMore = false;
      }

      if (lauthorStatus[currentUser]['loading']) {
        isLoading = true;
      }
    }

    return (
      <InfiniteScroll
        loadMore={this.loadMore}
        hasMore={hasMore}
        isLoading={isLoading}
        loader={<Spin className="center-loading" key={0} />}
        useWindow={false}
        className="post-list"
        header={lauthorStatus[currentUser] &&
          <div className="heading" key="header">
            <h3>Hunted by @{currentUser}</h3>
            <div className="heading-sub">
              <b>{lauthorStatus[currentUser].total_count}</b> products, <b>{formatAmount(lauthorStatus[currentUser].total_payout)}</b> hunter’s rewards were generated.
            </div>
            <div className="sort-option">
              <span className="text-small">Sort by: </span>
              <Select size="small" defaultValue={getSortOption('profile')} onChange={this.handleSortOption}>
                <Select.Option value="payout">Payout</Select.Option>
                <Select.Option value="created">New</Select.Option>
                <Select.Option value="vote_count">Vote Count</Select.Option>
                <Select.Option value="comment_count">Comment Count</Select.Option>
              </Select>
            </div>
          </div>
        }
      >
        {items}
      </InfiniteScroll>
    );
  }
}

const mapStateToProps = () => createStructuredSelector({
  currentUser: selectCurrentUser(),
  lauthorStatus: selectAuthorStatus(),
  posts: selectPosts(),
  authorPosts: selectAuthorPosts(),
});


const mapDispatchToProps = dispatch => ({
  getPostsByAuthor: (author, page) => dispatch(getPostsByAuthorBegin(author, page)),
  setCurrentUser: user => dispatch(setCurrentUserBegin(user)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HuntedListByAuthor);

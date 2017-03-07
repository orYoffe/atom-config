import React, {PropTypes, Component} from 'react'
import ReactDOM from 'react-dom'

let height = 0

export default class InfiniteScroll extends Component {
  static propTypes = {
    className: PropTypes.string,
    hasMore: PropTypes.bool,
    dispatch: PropTypes.func,
    fetchNextPage: PropTypes.func.isRequired,
    hasRendered: PropTypes.func.isRequired,
    windowScrollY: state._ui.get('window_scroll'),
    contentHeight: state._ui.get('infinite_scroll_height'),
  }

  static defaultProps = {
    hasMore: true,
  }

  componentDidMount() {
    // Make sure that we don't inherit previously computed infinite scroll height
    this.props.dispatch(UiActions.setInfiniteScrollHeight(0))
  }

  componentWillReceiveProps(nextProps) {
    let viewportHeight = window.innerHeight
    let viewportBottomHeight = nextProps.windowScrollY + viewportHeight
    let contentHeight = nextProps.contentHeight
    let limit = 100

    if (contentHeight >= viewportHeight && contentHeight - limit <= viewportBottomHeight) {
      this.props.fetchNextPage()
    }
  }

  componentDidUpdate() {
    let height = ReactDOM.findDOMNode(this.refs.infiniteScroll).offsetHeight
    this.props.dispatch(UiActions.setInfiniteScrollHeight(height))
    this.props.hasRendered()
  }

  render() {
    let displaySpinner = this.props.children && this.props.hasMore

    return (
      <div className="infinte-scroll-container">
        <div className={cx('infinite-scroll', this.props.className)} ref="infiniteScroll">
          {this.props.children}
        </div>
        {displaySpinner && (
          <div className="loading">
          </div>
        )}
      </div>
    )
  }
}

import React, {PropTypes, Component} from 'react'
import ReactDOM from 'react-dom'

export default class InfiniteScroll extends Component {
  static propTypes = {
    className: PropTypes.string,
    hasMore: PropTypes.bool,
    fetchNextPage: PropTypes.func.isRequired,
  }

  state = {
    height: 0
  }

  static defaultProps = {
    hasMore: true,
  }
  componentWillUpdate(nextProps, nextState) {
      const wrapper = document.querySelector('.a-search__popout')
      let viewportHeight = window.innerHeight
      let viewportBottomHeight = wrapper.scrollTop + viewportHeight
      let contentHeight = wrapper.scrollHeight
      let limit = 100

      if (contentHeight >= viewportHeight && contentHeight - limit <= viewportBottomHeight) {
        // this.props.fetchNextPage()
        console.log('---------------------fetch');
      }
  }


  componentDidUpdate() {
    let height = ReactDOM.findDOMNode(this.refs.infiniteScroll).offsetHeight
    this.setState({height})
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

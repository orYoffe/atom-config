import React, {PropTypes, Component} from 'react'

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
    const wrapper = this.refs.infiniteScroll.getDOMNode()
    let viewportHeight = window.innerHeight
    let viewportBottomHeight = wrapper.scrollTop + viewportHeight
    let contentHeight = wrapper.scrollHeight
    let limit = 100

    if (contentHeight >= viewportHeight && contentHeight - limit <= viewportBottomHeight) {
      // this.props.fetchNextPage()
      console.log('---------------------fetch');
    }
  }


  handleScroll(ev) {
    console.log("Scrolling!");
    const wrapper = this.refs.infiniteScroll.getDOMNode()
    console.log('-----------------asdasdasdas',wrapper)
    const viewportHeight = window.innerHeight
    const viewportBottomHeight = wrapper.scrollTop + viewportHeight
    const contentHeight = wrapper.scrollHeight
    const limit = 100

    if (contentHeight >= viewportHeight && contentHeight - limit <= viewportBottomHeight) {
      // this.props.fetchNextPage()
      console.log('---------------------fetch');
    }
  }

  componentDidMount() {

    const popup = this.refs.infiniteScroll.getDOMNode()
    console.debug(popup);
    popup.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    const popup = this.refs.infiniteScroll.getDOMNode()
    popup.removeEventListener('scroll', this.handleScroll);
  }


  componentDidUpdate() {
    let height = this.refs.infiniteScroll.getDOMNode().offsetHeight
    this.setState({height})
  }

  render() {
    let displaySpinner = this.props.children && this.props.hasMore

    return (
      <div className="search-infinte-scroll-container">
        <div className="search-infinite-scroll" ref="infiniteScroll">
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

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

  handleScroll(ev) {
    console.log("Scrolling!");
    const wrapper = document.getElmentById('search-infinte-scroll-container')
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
    const popup = document.getElmentById('search-infinte-scroll-container')
    popup.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    const popup = document.getElmentById('search-infinte-scroll-container')
    popup.removeEventListener('scroll', this.handleScroll)
  }


  componentDidUpdate() {
    let height = document.getElmentById('search-infinte-scroll-container').offsetHeight
    this.setState({height})
  }

  render() {
    let displaySpinner = this.props.children && this.props.hasMore

    return (
      <div id="search-infinte-scroll-container">
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

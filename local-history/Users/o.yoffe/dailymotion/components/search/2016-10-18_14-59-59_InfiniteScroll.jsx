import React, {PropTypes, Component} from 'react'

export default class InfiniteScroll extends Component {
  // static propTypes = {
  //   className: PropTypes.string,
  //   hasMore: PropTypes.bool,
  //   fetchNextPage: PropTypes.func.isRequired,
  // }

  state = {
    height: 0
  }

  static defaultProps = {
    hasMore: true,
  }

  handleScroll(ev) {
    const wrapper = document.querySelector('.a-search__popout')
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
    const popup = document.querySelector('.a-search__popout')
    popup.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    const popup = document.querySelector('.a-search__popout')
    popup.removeEventListener('scroll', this.handleScroll)
  }


  componentDidUpdate() {
    let height = document.querySelector('.a-search__popout').offsetHeight
    this.setState({height})
  }

  render() {
    let displaySpinner = this.props.children && this.props.hasMore

    return (
      <div>
          {this.props.children}
        {displaySpinner ? (
          <div className="loading">
          </div>
        ) : null}
      </div>
    )
  }
}

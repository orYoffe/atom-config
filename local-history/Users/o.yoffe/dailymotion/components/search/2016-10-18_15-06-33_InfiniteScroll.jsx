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

  getPopup() {
    if(!this.popup){
      this.popup = document.querySelector('.a-search__popout')
    }
    return this.popup
  }

  handleScroll(ev) {
    const wrapper = this.getPopup()
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
    const popup = this.getPopup()
    popup.addEventListener('scroll', this.handleScroll.bind(this))
  }

  componentWillUnmount() {
    const popup = this.getPopup()
    popup.removeEventListener('scroll', this.handleScroll)
  }


  componentDidUpdate() {
    // let height = this.getPopup().offsetHeight
    // this.setState({height})
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

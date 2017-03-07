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

  getPopup(){
    if(!this.popup){
      this.popup = document.querySelector('.a-search__popout')
    }
    return this.popup
  }

  handleScroll(ev) {
    const wrapper = getPopup()
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
    const popup = getPopup()
    popup.addEventListener('scroll', this.handleScroll)
  }

  componentWillUnmount() {
    const popup = getPopup()
    popup.removeEventListener('scroll', this.handleScroll)
  }


  componentDidUpdate() {
    let height = getPopup().offsetHeight
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

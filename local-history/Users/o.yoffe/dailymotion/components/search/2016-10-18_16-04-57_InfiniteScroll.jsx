import React, {PropTypes, Component} from 'react'

export default class InfiniteScroll extends Component {
  static propTypes = {
    className: PropTypes.string,
    hasMore: PropTypes.bool,
    loadNextPage: PropTypes.func.isRequired,
  }

  static defaultProps = {
    hasMore: true,
    containerClassName: 'a-search__popout',
  }

  getPopup() {
    if(!this.popup){
      this.popup = document.querySelector( '.'+ this.props.className)
    }
    return this.popup
  }

  handleScroll() {
    if(this.props.hasMore){
      const wrapper = this.getPopup()
      const viewportHeight = window.innerHeight
      const viewportBottomHeight = wrapper.scrollTop + viewportHeight
      const contentHeight = wrapper.scrollHeight
      const limit = 100

      if (contentHeight >= viewportHeight && contentHeight - limit <= viewportBottomHeight) {
        this.props.loadNextPage()
      }
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

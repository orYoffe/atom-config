import React, {PropTypes, Component} from 'react'

let oldScrollTop = 0

export default class InfiniteScroll extends Component {
  static propTypes = {
    className: PropTypes.string,
    hasMore: PropTypes.bool,
    isFetching: PropTypes.bool,
    loadNextPage: PropTypes.func.isRequired,
  }

  static defaultProps = {
    hasMore: true,
    containerClassName: 'a-search__popout',
  }

  getPopup() {
    if(!this.popup){
      this.popup = document.querySelector( '.'+ this.props.containerClassName)
    }
    return this.popup
  }

  handleScroll() {
    console.log('------handleScroll----');
    if(this.props.hasMore && !this.props.isFetching){
      const wrapper = this.getPopup()
      if(wrapper.scrollTop !== oldScrollTop){
        oldScrollTop = wrapper.scrollTop
        const viewportHeight = window.innerHeight
        const viewportBottomHeight = wrapper.scrollTop + viewportHeight
        const contentHeight = wrapper.scrollHeight
        const limit = 250

        if (contentHeight >= viewportHeight && contentHeight - limit <= viewportBottomHeight) {
          this.props.loadNextPage()
        }
      }
    }
  }

  componentDidMount() {
    const popup = this.getPopup()
    popup.addEventListener('scroll', ::this.handleScroll)
    console.log('---------should add listener---------');
  }

  componentWillUnmount() {
    const popup = this.getPopup()
    popup.removeEventListener('scroll', this.handleScroll)
    console.log('---------should remove listener---------');
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

import React, {PropTypes, Component} from 'react'
import { saveSearch } from 'components/search/form/search-recent.jsx'

let oldScrollTop = 0

let oldQuery = ''

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

  handleScroll() {
    if(oldQuery !== this.props.query){
      saveSearch(this.props.query)
      oldQuery = this.props.query
    }
    if(this.props.hasMore && !this.props.isFetching){
      const wrapper = this.getPopup()
      if(wrapper.scrollTop !== oldScrollTop){
        oldScrollTop = wrapper.scrollTop
        const viewportHeight = window.innerHeight
        const viewportBottomHeight = wrapper.scrollTop + viewportHeight
        const contentHeight = wrapper.scrollHeight
        const limit = 400

        if (contentHeight >= viewportHeight && contentHeight - limit <= viewportBottomHeight) {
          this.props.loadNextPage()
        }
      }
    }
  }

  getPopup() {
    if(!this.popup){
      this.popup = document.querySelector( '.'+ this.props.containerClassName)
    }
    return this.popup
  }

  componentDidMount() {
    const popup = this.getPopup()
    // popup.addEventListener('scroll', ::this.handleScroll)
  }

  componentWillUnmount() {
    const popup = this.getPopup()
    popup.removeEventListener('scroll', this.handleScroll)
  }


  render() {
    let displaySpinner = true || this.props.children && this.props.hasMore

    return (
      <div>
        {this.props.children}
        {displaySpinner ? (
          <div className="loading">
            <img src="/images/icons/loading.gif" />
          </div>
        ) : null}
      </div>
    )
  }
}

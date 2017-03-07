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

  
    handleScroll(ev) {
          console.log("Scrolling!");
          const wrapper = React.findDOMNode(this.refs.popup)
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
  const wrapper = this.refs.popup.getDOMNode()
  console.log('-----------------asdasdasdas',wrapper)

        const popup = React.DOM.findDOMNode(this.refs.popup)
        console.debug(popup);
        popup.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        const popup = React.DOM.findDOMNode(this.refs.popup)
        popup.removeEventListener('scroll', this.handleScroll);
    }


  componentDidUpdate() {
    let height = ReactDOM.findDOMNode(this.refs.infiniteScroll).offsetHeight
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

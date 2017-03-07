import React, { Component } from 'react'
import history from 'js/lib/dm/history.es6'
import _ from 'lodash'

import SearchRecent from 'components/search/form/search-recent.jsx'
import { saveSearch } from 'components/search/form/search-recent.jsx'

export default class SearchForm extends Component {
  trans = DM_ENV['search/search']

  constructor(props) {
    super()

    this.prevQuery = ''

    this.state = {
      focus: false,
      value: props.query
    }
  }

  componentWillMount() {
    this.submit = _.debounce(::this.onSubmit, 400)
  }

  componentWillUnmount() {
    this.submit.cancel()
  }

  onInputKeyUp(e) {
    if (e.keyCode === 13) { // Enter
      let { value } = this.refs.input.getDOMNode()
      if(value && value.trim().length){
        saveSearch(value)
      }
      this.onSubmit(value)
    } else if(e.keyCode === 40) { // Arrow Down
      console.log('down');
    } else if(e.keyCode === 13) { // Arrow Up
      console.log('up');
      
    }
  }

  onSubmit(value) {
    if (!value.length) {
      // on enter (when closed) should submit with the same query
      if(this.prevQuery === value && !window.location.pathname.startsWith('/search/')) return
    }
    this.prevQuery = value
    let url = `/search/${value}`
    if (this.props.selectedTab)
      url += `/${this.props.selectedTab}`
    history.pushState(null, url) // must limit this, since it will re-render whole a-search because of routing
  }

  change(value) {
    this.setState({ value })
    this.onSubmit(value)
  }

  onInputChange(e) {
    let value = e.target.value
    this.setState({ value })
    this.submit(value)
  }


  onClear(e) {
    this.setState({ value: '' })
    this.props.close()
  }

  onInputFocus() {
    this.setState({ focus: true })
  }
  onInputBlur() {
    // if no timeout, then icon-close disapear before being clicked
    setTimeout(() => this.setState({ focus: false }), 100)
  }

  render() {

    let { query } = this.props
    let { focus, value } = this.state

    let icon
    if (focus)
      icon = <i className="icon-close2" key="close" onClick={::this.onClear}></i>
    else
      icon = <i className="icon-search" key="search" ></i>

    return (
      <div className="a-search__form">
        <div className="a-search__form__input">
          <input
            ref="input"
            type="text"
            onChange={::this.onInputChange}
            onKeyUp={::this.onInputKeyUp}
            value={this.state.value}
            onFocus={::this.onInputFocus}
            onBlur={::this.onInputBlur}
            placeholder={this.trans.search_placeholder}
          />
          { icon }
        </div>
        <SearchRecent open={focus} submit={::this.change} />
      </div>
    )
  }

}

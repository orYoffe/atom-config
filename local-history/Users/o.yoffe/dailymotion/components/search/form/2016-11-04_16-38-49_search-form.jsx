import React, { Component } from 'react'
import history from 'js/lib/dm/history.es6'
import _ from 'lodash'

import SearchRecent from 'components/search/form/search-recent.jsx'
import { saveSearch, getSearches } from 'components/search/form/search-recent.jsx'

export default class SearchForm extends Component {
  trans = DM_ENV['search/search']

  constructor(props) {
    super()

    this.prevQuery = ''

    this.state = {
      focus: false,
      value: props.query,
      focusedItem: null,
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
      debugger
      let { value } = this.refs.input.getDOMNode()
      if(value && value.trim().length){ // search
        saveSearch(value)
        this.change(value)
        this.refs.input.getDOMNode().blur()
      }else if(Number.isInteger(this.state.focusedItem) && this.state.focus){ // click on recent search item
        value = getSearches()
        if(value && value[this.state.focusedItem]){
          this.change(value[this.state.focusedItem])
        }
      }
    } else if(e.keyCode === 40) { // Arrow Down
      if(this.state.focusedItem !== null){
        let nextFocusedItem = this.state.focusedItem === 4 ? 0 : ++this.state.focusedItem
        this.setState({focusedItem: nextFocusedItem})
      }else {
        this.setState({focusedItem: 0})
      }
    } else if(e.keyCode === 38) { // Arrow Up
      if(this.state.focusedItem !== null){
        let nextFocusedItem = this.state.focusedItem === 0 ? 4 : --this.state.focusedItem
        this.setState({focusedItem: nextFocusedItem})
      }else {
        this.setState({focusedItem: 4})
      }
    }
  }

  onSubmit(value) {
    this.prevQuery = value
    let url = `/search/${value}`
    if (this.props.selectedTab)
      url += `/${this.props.selectedTab}`
    history.pushState(null, url) // must limit this, since it will re-render whole a-search because of routing
  }

  change(value) {
    if (!value.length) {
      // on enter (when closed) should submit with the same query
      if(this.prevQuery === value || !window.location.pathname.startsWith('/search/')) return
    }
    this.setState({ value })
    if (value.length) {
      this.onSubmit(value)
    }else {
      this.onClear()
    }
  }

  onInputChange(e) {
    let value = e.target.value
    this.change(value)
  }

  onSelect(search, e) {
    e.preventDefault()
    this.change(search)
  }

  onClear(e) {
    this.setState({
      value: '',
      focusedItem: null,
     })
    this.props.close()
  }

  onInputFocus() {
    this.setState({ focus: true })
  }

  onInputBlur() {
    // if no timeout, then icon-close disapear before being clicked
    setTimeout(() => this.setState({
      focus: false,
      focusedItem: null,
    }), 100)
  }

  render() {

    let { query } = this.props
    let { focus, value, focusedItem } = this.state

    let icon
    if (query && query.length)
      icon = <i className="icon-close-black" key="close" onClick={::this.onClear}></i>
    else
      icon = <i className="icon-search" key="search"></i>

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
        <SearchRecent open={focus && !query} submit={::this.change} focusedItem={focusedItem} onSelect={this.onSelect} />
      </div>
    )
  }

}

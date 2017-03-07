import React, { Component } from 'react'
import history from 'js/lib/dm/history.es6'
import _ from 'lodash'

import SearchRecent from 'components/search/form/search-recent.jsx'

export default class SearchForm extends Component {

  constructor() {
    super()

    this.query = ''

    this.state = {
      focus: false
    }
  }

  componentWillMount() {
    this.submit = _.debounce(::this.onSubmit, 400)
  }

  componentWillUnmount() {
    this.submit.cancel()
  }

  onKeyUp(e) {
    if (e.keyCode === 13)
      this.onSubmit()
  }

  onSubmit() {
    let { value } = this.refs.input.getDOMNode()
    if (!value.length || this.query === value) return
    this.query = value
    let url = `/search/${value}`
    if (this.props.selectedTab) 
      url += `/${this.props.selectedTab}`
    history.pushState(null, url) // must limit this, since it will re-render whole a-search because of routing
  }

  onClear(e) {
    this.refs.input.getDOMNode().value = ''
    this.props.close()
  }

  onFocus() {
    this.setState({ focus: true })
  }
  onBlur() {
    // if no timeout, then icon-close disapear before being clicked
    setTimeout(() => this.setState({ focus: false }), 100)
  }

  render() {

    let { query } = this.props
    let { focus } = this.state

    let icon
    if (focus)
      icon = <i className="icon-close2" key="close" onClick={::this.onClear}></i>
    else
      icon = <i className="icon-search" key="search" ></i>
// TODO translations
    return (
      <div className="a-search__form">
        <div className="a-search__form__input">
          <input
            ref="input"
            type="text"
            onChange={this.submit}
            onKeyUp={::this.onKeyUp}
            defaultValue={this.props.query}
            onFocus={::this.onFocus}
            onBlur={::this.onBlur}
            placeholder={this.trans.search_placeholder}}
          />
          { icon }
        </div>
        <SearchRecent open={focus} />
      </div>
    )
  }

}

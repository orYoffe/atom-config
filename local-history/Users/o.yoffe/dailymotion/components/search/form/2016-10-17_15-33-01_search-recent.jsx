import React, { Component } from 'react'
import store from 'store'

export default class SearchRecent extends Component {

  constructor() {
    super()
    const MAX_NB_ITEMS = 5
    let searches = store.get('a_search_history') || []
    searches = searches.slice(-MAX_NB_ITEMS)
    this.state = { 
      searches
    }
  }

  render() {

    let { open } = this.props
    let { searches } = this.state

    if (!searches.length) return null

    searches = searches.map((search,i) => {
      return <a href="" className="a-search__form__recent__i" >{ search }</a>
    })

    let style = {}
    if (open) style.display = 'flex'
// TODO translations
    return (
      <div className="a-search__form__recent" style={style} >
        <h2>Recent searches</h2>
        <div>{ searches }</div>
      </div>
    )
  }

}

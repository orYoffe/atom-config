import React, { Component } from 'react'
import { Router, Route } from 'react-router'
import history from 'js/lib/dm/history.es6'
import Search from 'components/search/search.jsx'

// Always display Search, and get params if search url
export default class SearchRouter extends Component {
  render() {
    return (
      <Router history={history}>
      	<Route path="/" component={Search}>
          <Route path="search/:query(/:tab)" component={Search} />
          <Route path="*" component={Search} />
        </Route>
      </Router>
    )
  }
}

window.hasAlgoliaSearch = true

// if we find div (in case of gatekeeper)
let placeholderClass = '.sd_header__a-search'
let searchPlaceholder = document.querySelector(placeholderClass)
// if (searchPlaceholder)
React.render(<SearchRouter key={placeholderClass + 'special_key'} />, searchPlaceholder)

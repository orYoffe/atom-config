import { saveSearch } from 'components/search/form/search-recent.jsx'
import history from 'js/lib/dm/history.es6'

export function navigate(query, url, e) {
  e.preventDefault()
  if(query && typeof query === 'string' && query.trim().length > 0){
    saveSearch(query)
  }
  if(url && url.indexOf('search') > -1){
    
  }else {
    window.location.replace(url)
  }
}
import { saveSearch } from 'components/search/form/search-recent.jsx'

export function navigate(query, url, e) {
  e.preventDefault()
  if(query && typeof query === 'string' && query.trim().length > 0){
    saveSearch(query)
  }
  if(url.indexOf('search') === -1){
    window.location.replace(url)
  }else{
    debugger
  }
}

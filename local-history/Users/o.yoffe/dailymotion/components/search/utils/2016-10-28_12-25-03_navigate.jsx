import { saveSearch } from 'components/search/form/search-recent.jsx'

export function navigate(query, url, e) {
  e.preventDefault()
  if(query && typeof query === 'string' && query.trim().length > 0){
    saveSearch(query)
  }
  window.location.replace(url)
}

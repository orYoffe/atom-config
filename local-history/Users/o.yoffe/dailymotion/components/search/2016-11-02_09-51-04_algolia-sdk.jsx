class AlgoliaSDK {

  constructor() {
    this.BASE_URL = 'https://search.api.dailymotion.com/v1/'
    this.page = 1
  }

  get(query, type='all', familyFilter=true, page=1) {
    // TODO clean up SDK as we're only using "all" (overview) tab for fetching
    this.page = page
    let url = this.BASE_URL

    switch (type) {
      case 'all':
        url += 'overview'
        break
      case 'videos':
        url += 'videos'
        break
      case 'channels':
        url += 'users'
        break
      case 'playlists':
        url += 'playlists'
        break
        default:
          url += 'overview'
    }

    url += `/?q=${query}&family_filter=${familyFilter}`
debugger
    return fetch(url).then(function(response) {
      return response.json()
    })

  }

}

export default new AlgoliaSDK

class AlgoliaSDK {

  constructor() {
    this.BASE_URL = 'https://search.api.dailymotion.com/v1/'
    this.page = 1
  }

  get(query, type='all', familyFilter=true, page=1) {

    let totalResults
    let data
    switch (this.props.selectedTab) {
      case 'all':
        let { lives, playlists, users, videos } = res
        totalResults = 0
        for (let key in res) totalResults += res[key].paging.total_count
        this.setState({
          fetching: false,
          totalResults,
          videos,
          lives,
          playlists,
          users,
        })
        break
      case 'videos':
        totalResults = 0
        totalResults += res.paging.total_count
        this.setState({
          fetching: false,
          totalResults,
          videos: res,
        })
        break
      case 'channels':
        data = res && res.data
        totalResults = 0
        totalResults += res.paging.total_count
        this.setState({
          fetching: false,
          totalResults,
          users: data,
        })
        break
      case 'playlists':
        totalResults = 0
        totalResults += res.paging.total_count
        this.setState({
          fetching: false,
          totalResults,
          playlists: res,
        })
        break
      default:
    }
    }

    url += `/?q=${query}&family_filter=${familyFilter}`

    return fetch(url).then(function(response) {
      return response.json()
    })

  }

}

export default new AlgoliaSDK
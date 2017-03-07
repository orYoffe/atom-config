const parse = res => {

  let totalResults
  let data
  let resultData
  
  switch (this.props.selectedTab) {
    case 'all':
    let { lives, playlists, users, videos } = res
    totalResults = 0
    for (let key in res) totalResults += res[key].paging.total_count
    resultData = {
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
    resultData = {
      fetching: false,
      totalResults,
      videos: res,
    })
    break
    case 'channels':
    data = res && res.data
    totalResults = 0
    totalResults += res.paging.total_count
    resultData = {
      fetching: false,
      totalResults,
      users: data,
    })
    break
    case 'playlists':
    totalResults = 0
    totalResults += res.paging.total_count
    resultData = {
      fetching: false,
      totalResults,
      playlists: res,
    })
    break
  }
}

export default parse

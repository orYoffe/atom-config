const parse = (res, selectedTab) => {

  let totalResults = 0
  let data
  let resultData = {
    fetching: false,
    totalResults: 0,
  }

  switch (selectedTab) {
    case 'all':
    for (let key in res) resultData.totalResults += res[key].paging.total_count
    let { lives, playlists, users, videos } = res
    resultData = {
      fetching: false,
      resultData.totalResults,
      videos,
      lives,
      playlists,
      users,
    }
    break
    case 'videos':
    case 'playlists':
    resultData.totalResults += res.paging.total_count
    resultData = {
      fetching: false,
      resultData.totalResults,
      videos: res,
    }
    resultData[selectedTab] = res
    break
    case 'channels':
    data = res && res.data
    resultData.totalResults += res.paging.total_count
    resultData.users = data
    break
  }
  return resultData
}

export default parse

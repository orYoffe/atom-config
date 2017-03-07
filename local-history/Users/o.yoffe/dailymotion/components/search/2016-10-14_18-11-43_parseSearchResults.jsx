const parse = (res, selectedTab) => {

  let data
  let resultData = {
    fetching: false,
    totalResults: 0,
  }
  if(selectedTab === 'all'){
    for (let key in res) resultData.totalResults += res[key].paging.total_count
    let { lives, playlists, users, videos } = res
    resultData = {
      videos,
      lives,
      playlists,
      users,
      ...resultData,
    }
  } else {
    resultData.totalResults += res.paging.total_count
    if(selectedTab === 'channels'){
      resultData.users = res
    } else {
      resultData[selectedTab] = res
    }
  }

  return resultData
}

export default parse

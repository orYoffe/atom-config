import React, { Component } from 'react'
import { Link } from 'react-router'
import GridList from 'components/lists/grid-list.jsx'
import ChannelListSmall from 'components/lists/channels/channel-list-small.jsx'
import PlaylistItemSmall from 'components/lists/playlists/playlist-item-small.jsx'
import VideoItem from 'components/lists/videos/video-item.jsx'
import ItemPlaceholder from 'components/lists/placeholder/item-placeholder.jsx'
import { navigate } from 'components/search/utils/navigate.jsx'

const nowDate = new Date()

export default class SearchAll extends Component {
  trans = DM_ENV['search/search']

  render() {
    let { videos, lives, playlists, users, query, fetching } = this.props

    if (playlists) {
      playlists = playlists.data.map((video,i) => {
        return <PlaylistItemSmall key={i} query={query} {...video} />
      })
      playlists = playlists.slice(0,5)
    }

    let videos1 = null,
        videos2 = null,
        indexToSplit = 6

    if(lives && lives.data && lives.data.length){
      lives.data = lives.data.filter(i => i.is_on_air || (i.start_time > nowDate))

      if(lives.data.length){
        if(videos && videos.data && videos.data.length){
          videos.data = lives.data.concat(videos.data)
        }else {
          videos = lives
        }
      }
    }

    if (videos) {
      videos1 = videos.data.slice(0,indexToSplit).map((video,i) => {
        return <VideoItem key={i} {...video} query={query} />
      })
      videos2 = videos.data.slice(indexToSplit,videos.data.length-1).map((video,i) => {
        return <VideoItem key={i} {...video} query={query} />
      })
    }

    const hasVideos = videos1 && videos1.length
    const hasPlaylists = playlists && playlists.length

    return (
      <div className="search-all">
        {users && users.data && users.data.length ? <ChannelListSmall users={users} query={query} fetching={fetching} /> : null}
        <div className="search-all__lists">

          {hasVideos ? <div className="search-all__videos">
            <GridList
              columns={hasPlaylists ? 2 : 3}
              margins={10}
              marginBottom={20}
              fetching={fetching}
              placeholder={<ItemPlaceholder type="video" />}
            >
              { videos1 }
            </GridList>
          </div>: null}

          {hasPlaylists ? <div className="search-all__playlists">
            <Link to={`/search/${query}/playlists`} className="search-all__playlists__title"
              onClick={navigate.bind(this, query, `/search/${query}/playlists`)}>
              {this.trans.playlists && this.trans.playlists.toUpperCase()} <span>{'>'}</span>
          </Link>
          <GridList
            columns={hasVideos ? 1 : 3}
            margins={10}
            marginBottom={20}
            fetching={fetching}
            placeholder={<ItemPlaceholder type="playlist" />}
            >
            { playlists }
          </GridList>
        </div> : null}

        </div>

        <GridList
          columns={3}
          margins={10}
          marginBottom={20}
          fetching={fetching}
          placeholder={<ItemPlaceholder type="video" />}
        >
          { videos2 }
        </GridList>

      </div>
    )
  }

}

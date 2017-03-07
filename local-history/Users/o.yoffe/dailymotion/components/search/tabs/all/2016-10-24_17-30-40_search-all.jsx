import React, { Component } from 'react'
import GridList from 'components/lists/grid-list.jsx'
import ChannelListSmall from 'components/lists/channels/channel-list-small.jsx'
import PlaylistItemSmall from 'components/lists/playlists/playlist-item-small.jsx'
import VideoItem from 'components/lists/videos/video-item.jsx'
import ItemPlaceholder from 'components/lists/placeholder/item-placeholder.jsx'

export default class SearchAll extends Component {
  trans = DM_ENV['search/search']

  render() {
    let { videos, lives, playlists, users, query, fetching } = this.props

    if (playlists) {
      playlists = playlists.data.map((video,i) => {
        return <PlaylistItemSmall key={i} {...video} />
      })
      playlists = playlists.slice(0,5)
    }

    let videos1 = null,
        videos2 = null,
        indexToSplit = 6
    if (videos) {
      videos1 = videos.data.slice(0,indexToSplit).map((video,i) => {
        return <VideoItem key={i} {...video} query={query} />
      })
      videos2 = videos.data.slice(indexToSplit,videos.data.length-1).map((video,i) => {
        return <VideoItem key={i} {...video} query={query} />
      })
    }

    return (
      <div className="search-all">
        <ChannelListSmall users={users} query={query} fetching={fetching} />
        <div className="search-all__lists">

          <div className="search-all__videos">
            <GridList
              columns={2}
              margins={10}
              marginBottom={20}
              fetching={fetching}
              placeholder={<ItemPlaceholder type="video" />}
            >
              { videos1 }
            </GridList>
          </div>

          {playlists.length ? 
            <div className="search-all__playlists">
            <a href={`/search/${query}/playlists`} className="search-all__playlists__title" >
              {this.trans.playlists && this.trans.playlists.toUpperCase()} <span>{'>'}</span>
            </a>
            <GridList
              columns={1}
              margins={10}
              marginBottom={20}
              fetching={fetching}
              placeholder={<ItemPlaceholder type="playlist" />}
            >
              { playlists }
            </GridList>
          </div> 
          : null}

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

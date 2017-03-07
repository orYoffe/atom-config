import React, { Component } from 'react'
import ChannelItem from 'components/lists/channels/channel-item'
import GridList from 'components/lists/grid-list.jsx'

export default class SearchChannels extends Component {

  render() {
    let { users, query } = this.props
    if(!users || !users.data) {
      return <div></div>
    }

    users = users.data.map((user, i) => {
      return <ChannelItem query={query} key={i} user={user} />
    })

    return (
      <div className="channel-list">
        <GridList
          columns={3}
          margins={10}
          marginBottom={20}
        >
          { users }
        </GridList>
      </div>
    )
  }

}

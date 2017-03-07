import React, { Component } from 'react'
import GridList from 'components/lists/grid-list.jsx'
import ChannelItemSmall from 'components/lists/channels/channel-item-small'
import ItemPlaceholder from 'components/lists/placeholder/item-placeholder.jsx'
import { navigate } from 'components/search/utils/navigate.jsx'

export default class ChannelListSmall extends Component {

  trans = DM_ENV['search/lists/channels']
  render() {

    let { users, query, fetching } = this.props
    if(!users || !users.data) {
      return <div></div>
    }

    users = users.data.slice(0,6)
    users = users.map((user, i) => {
      return <ChannelItemSmall query={query} key={i} user={user} />
    })

    return (
      <div className="channel-list-small">
        <a href={`/search/${query}/channels`}  onClick={navigate.bind(this, query, `/search/${query}/channels`)} className="channel-list-small__title" >
          {this.trans.channels && this.trans.channels.toUpperCase()} <span className="channel-list-small__title-arrow">{'>'}</span>
        </a>
        <div className="channel-list-small__channels">

          <GridList
            columns={6}
            margins={5}
            marginBottom={0}
            fetching={fetching}
            placeholder={<ItemPlaceholder type="channel-small" />}
            numberOfPlacholders={6}
          >
            { users }
          </GridList>

        </div>
      </div>
    )
  }
}

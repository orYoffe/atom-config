import React, { Component } from 'react'
import { Link } from 'react-router'
import ChannelItemSmall from 'components/lists/channels/channel-item-small'

export default class ChannelListSmall extends Component {
// TODO translations
  render() {

    let { users } = this.props
    if(!users.data) {
      return <div></div>
    }

    users = users.data.filter((user, i) => i<5)
    users = users.map((user, i) => {
      return <ChannelItemSmall key={i} user={user} />
    })

    return (
      <div className="channel-list-small">
        <Link className="channel-list-small__title" to={`/search/${this.props.query}/channels`}>
          CHANNELS <span>{'>'}</span>
        </Link>
        <div className="channel-list-small__channels">
          { users }
        </div>
      </div>
    )
  }
}

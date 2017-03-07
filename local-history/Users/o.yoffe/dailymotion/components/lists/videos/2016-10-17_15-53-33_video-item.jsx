import React, { Component } from 'react'
import moment from 'moment'
import TextClamp from 'components/utils/text-clamp/text-clamp'

// TODO: translations

class VideoItem extends Component {
  trans = DM_ENV['search/lists/videos']

  render() {

    console.log(this.props)

    let { isPlaylist, className, owner, title, name, duration, thumbnails, views_total, created_date, html_url, videos_total } = this.props
    let thumbnail = thumbnails.x360

    const locale = window.DM_Context && window.DM_Context.content_language
    let ago = locale ? moment(created_date).locale(locale).fromNow() : moment(created_date).fromNow()

    let durationS = moment.duration(duration, 'seconds').seconds()
    let durationM = moment.duration(duration, 'seconds').minutes()

    let live = false

    duration = (durationM<10 ? '0'+durationM : durationM) + ':' + (durationS<10 ? '0'+durationS : durationS)

    let caption
    if (isPlaylist) {
      caption = <div className="video-item__thumb__videos-total">{ videos_total } {this.trans.videos && this.trans.videos.toUpperCase()}</div>
    }
    else {
      caption = live ? <div className="video-item__thumb__live">{this.trans.LIVE}</div> : <div className="video-item__thumb__duration">{ duration }</div>
    }

    let classNames = ['video-item']
    if (isPlaylist) classNames.push('video-item--playlist')

    return (
      <div className={classNames.join(' ')} >

        { isPlaylist ?
          <div className="video-item__playlist-bg"></div>
          : null
        }

        <a href={html_url} className="video-item__thumb">
          { caption }
          <img src={thumbnail} />
        </a>

        <div className="video-item__description">

          <h2 className="video-item__description__title">
            <a href={html_url} >
              <TextClamp clamp={2}>{ title || name }</TextClamp>
            </a>
          </h2>
          <p className="video-item__description__channel">
            {this.trans.by} <a href={"/"+owner.username} >{ owner.fullname }</a>
          </p>
          { !isPlaylist ?
            <p className="video-item__description__infos">
              <span className="video-item__description__ago">{ ago }</span>
              <span className="video-item__description__sep">•</span>
              <span className="video-item__description__views">{ views_total  + ' ' + this.trans.views}</span>
            </p>
          : null }
        </div>

      </div>
    )
  }
}

VideoItem.defaultProps = {
  isPlaylist: false
}

export default VideoItem

import React, { Component } from 'react'
import moment from 'moment'
import TextClamp from 'components/utils/text-clamp/text-clamp'
import VerifiedBadge from 'components/lists/verified-badge.jsx'
import { navigate } from 'components/search/utils/navigate.jsx'
import Trans from 'components/utils/trans/trans'

class VideoItem extends Component {
  trans = DM_ENV['search/lists/videos']

  render() {
    let videoObj,
        live

    if(this.props.hasOwnProperty('is_on_air')){
        videoObj = this.props.video
        live = this.props.is_on_air || this.props.start_time
    }else {
        videoObj = this.props
        live = false
    }

    let { query, isPlaylist, className, owner, title, name, duration, thumbnails, views_total, created_date, html_url, videos_total, content_type, thumbnail_360_url } = videoObj

    let thumbnail = thumbnails ? thumbnails.x360 : thumbnail_360_url
    const username = owner ? owner.username : videoObj['owner.url'].substr(videoObj['owner.url'].lastIndexOf('com/') + 3)
    const fullname = owner ? owner.fullname : videoObj['owner.screenname']

    const locale = window.DM_Context && window.DM_Context.content_version
    let ago = locale ? moment(created_date).locale(locale).fromNow() : moment(created_date).fromNow()

    let durationS = moment.duration(duration, 'seconds').seconds()
    let durationM = moment.duration(duration, 'seconds').minutes()


    duration = (durationM<10 ? '0'+durationM : durationM) + ':' + (durationS<10 ? '0'+durationS : durationS)

    let caption
    if (isPlaylist) {
      caption = <div className="video-item__thumb__videos-total">{ videos_total } {this.trans.videos && this.trans.videos.toUpperCase()}</div>
    }
    else {
      if(locale){
        moment.locale(locale)
      }
      const startTime = this.props.start_time && !this.props.is_on_air ? ': ' + moment(this.props.start_time).format('MMM DD').toUpperCase().replace(/\./g, '') : null
      caption = live ? <div className="video-item__thumb__live">{this.trans.Live && this.trans.Live.toUpperCase()}{startTime}</div> : <div className="video-item__thumb__duration">{ duration }</div>
    }

    let classNames = ['video-item']
    if (isPlaylist) classNames.push('video-item--playlist')

    return (
      <div className={classNames.join(' ')} key={html_url}>

        { isPlaylist ?
          <div className="video-item__playlist-bg"></div>
          : null
        }

        <a href={html_url} onClick={navigate.bind(this, query, html_url)} className="video-item__thumb">
          { caption }
          <img src={thumbnail} />
          <div className="play"></div>
        </a>

        <div className="video-item__description">

          <h2 className="video-item__description__title">
            <a href={html_url} onClick={navigate.bind(this, query, html_url)}  >
              <TextClamp clamp={2}>{ title || name }</TextClamp>
            </a>
          </h2>
          <p className="video-item__description__channel">
            {this.trans.by} <a href={"/"+username} onClick={navigate.bind(this, query, "/"+username)}  >{ fullname }<VerifiedBadge verified={content_type === "verified-partner"} /></a>
          </p>
          { !isPlaylist ?
            <p className="video-item__description__infos">
              {!live ? <span className="video-item__description__ago">{ ago }</span> : null }
              {!live ? <span className="video-item__description__sep">•</span> : null }
              <span className="video-item__description__views">{live ? 
                  <Trans context={this.trans} isPlural={this.props.views_total !== 1}>viewers</Trans> 
                    : <Trans context={this.trans} isPlural={this.props.views_total !== 1}>views</Trans>  
                  }
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

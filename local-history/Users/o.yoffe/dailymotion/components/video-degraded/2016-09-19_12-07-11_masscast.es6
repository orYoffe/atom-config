import request from 'superagent'
import $ from 'jquery'
import ping from 'components/video-degraded/ping'

// require('DM_PlayerEvents')
// require('DM_PlayerV5Events')

// "outframedPositions" represents positions that should / could be run out of any iframe.
// x28 = custom js, is a custom js code generally written by an ad partner that could have a visual impact on any portion of a page
//       like a custom skin.
var outframedPositions = ['x28','x29', 'Top3', 'x70']
// "assistedOutframedPositions" represents outframed positions that requires to be executed in a certain manner.
// Other outframed positions can be run as is.
// Exemple:
//   - a Top3 requires an ajax call to get skin parameters and a call to a specific js function to be rendered.
var assistedOutframedPositions = ['Top3', 'x28']

function getRandParameter() {
  var max = 99999999998
  var min = max/2

  return Math.floor(Math.random() * (max - min)) + min
}

function getAdsFromOAS(url, cb) {
  return request('GET', url)
    .send()
    .end(function(err, res) {
      if (err) {
        return console.log(err)
      }
      cb(res)
    })
}

function parseOASResponse(response, positions) {
  var positionCodes = {}

  // If only one positions has been required from OAS
  if (positions && positions.length == 1) {
    positionCodes[positions[0]] = response
  }
  else {
    var splitted = response.split('<!--OAS AD="')
    if (splitted[0].match(/^\s*$/)) {
      splitted.shift()
    }
    for (var i = 0, l = splitted.length ; i < l ; i++) {
      var positionNameEnd = splitted[i].indexOf('"-->')
      positionCodes[splitted[i].slice(0, positionNameEnd)] = splitted[i].slice(positionNameEnd + 4).trim() // 4 = '"-->'.length
    }
  }

  return positionCodes
}

function handlePositionCodes(positionCodes) {

  var outFramedHandler = function(position, positionCode) {
    log('Masscast', 'Position', position, ' is "outframed" and need to be run out of an iframe .')
    handleOutframedPositionCode(position, positionCode)
  }
  var inFramedHandler = function(position, positionCode) {
    updatePositionViaIframe(position, positionCode)
  }

  var handleList = []

  for (var position in positionCodes) {
    if (!positionCodes.hasOwnProperty(position)) continue; // just to be safe

    var positionCode = positionCodes[position]

    try
    {
      var $item = $('#mc_' + position)

      // * hide position if :
      //   - positionCode not present
      //   - positionCode is "// Default ad"
      if (!positionCode || positionCode.match(/\/\/ Default ad/)) {
        $item.length && $item.empty().hide()
        log('Masscast', 'Position', position, 'not found or empty, hide its container from page.')
        continue
      }

      // Show container (if any) since there is a code for this position
      $item.length && $item.removeClass('mc_hide')
      if (position == 'Right' && window.DM_DisplayAds.adpositions.indexOf("Right")) {
        $('body').addClass('has-skyscraper')
      }

      // Is 'position' an outframed position?
      if (
          outframedPositions.indexOf(position) > -1 &&
          positionCode.indexOf('OAS_FORCE_IFRAME') === -1
          // OAS_FORCE_IFRAME is a comment in the position code used for outframed positions
          // that uses document.write in their code (hence not allowed to be outframed)
          // and are able to run from inside a friendly iframe (ex: undertone via x28 or x70)
          // OAS_FORCE_IFRAME have to be added by traffic team to the position code.
      ) {
        handleList.push([position, positionCode, outFramedHandler])
        continue
      }
      else if (!$item.length) {
        log('Masscast', 'Position', position, ' container not found, do nothing.')
        continue
      }

      // Render via iframe
      handleList.push([position, positionCode, inFramedHandler])
    }
    catch(e) {
      log('Masscast', 'Exception catched while rendering', position, e.message)
    }
  }
  handleNext(handleList, true)
}

function handleNext(handleList, runNow) {
  var toHandle = handleList.shift()

  if (toHandle) {
    run(
      () => {
        toHandle.pop().apply(null, toHandle)
        handleNext(handleList)
      },
      runNow
    )
  }
}

function run(runner, runNow) {
  if (runNow) {
    runner()
  }
  else {
    setTimeout(runner, 1500)
  }
}

function handleOutframedPositionCode(position, positionCode) {
  // If positionCode is a string, and we run it via eval.
  if(/string/i.test(Object.prototype.toString.call(positionCode))) {
    documentWriteBackup = document.write
    document.write = function(content) {
      log('Masscast', '!!! BEWARE !!!', position, 'tried to document.write on an already built page :', content)
    }

    // Code inspired from jquery globalEval, to execute javascript from a string in global context
    (window.execScript || function(positionCode) {
      window["eval"].call(window, positionCode)
    })(positionCode)

    document.write = documentWriteBackup
  }
  // We have no idea what to do with this position code...
  else {
    log('Masscast', 'cannot run position', position,  'code:', positionCode)
  }
}

function preCodeInjection(frame) {

  frame.inDapIF = true

  frame.ping = parent.ping

  frame.masscast =
  {
    getElementHeight: function(el) {
      return parseInt(parent.$(el).css('height'), 10)
    },
    adjustHeight: function(h) {
      var contentHeight = masscast.getElementHeight(document.getElementById('content')),
        bodyHeight = masscast.getElementHeight(document.body),
        parentFrameHeight = masscast.getElementHeight(frameElement.parentNode),
        height =
          (h || 0) ||
          contentHeight

      // if a height param was provided, force #content to occupy full width and height of the iframe
      if (h) document.getElementById('content').style.cssText += 'position:absolute;top:0;bottom:0;left:0;right:0;'

      frameElement.style.height = height + 'px'
      frameElement.parentNode.style.height = 'auto'

      // If iframe has no significant height (height < 50) and iframe parent has signifiacant height (> 100)
      // then ad display is probably not inside the iframe but inside its parent.
      // Then we should hide the iframe to prevent any extra spaces to be visible.
      if (height < 50 && parentFrameHeight >= 100 && frameElement.name.indexOf("x70") == -1) {
        frameElement.style.display = 'none'
      }
      else if (frameElement.name.indexOf("x52") != -1) {
        frameElement.style.display = 'auto'
        frameElement.style.height = '254px'
      }
      else {
        frameElement.style.display = 'block'

        // Last height adjustment, if ad content is not in #content but in body.
        if (height < 50 && bodyHeight >= 100) {
          frameElement.style.height = bodyHeight + 'px'
        }
      }
    },
    // Supposed to load a js that works "alone"
    loadDmJs: function(src) {
      var s = frame.document.createElement('script')
      s.type = 'text/javascript'
      s.src = this.getRealPath(src, frame.parent.STATIC_BASE_URL, frame.parent.DMAssetsMap); // get versioned path
      s.async = true
      frame.document.body.appendChild(s)
    },
    getRealPath: function(path, baseURL, staticConf) {
      return baseURL + path + '.v' + staticConf[path.replace('/', '\/')];
    },
    render: function(name, params) {
      frame[name + 'Parameters'] = params
      masscast.loadDmJs('/js/lib/dm/masscast/iframed/' + name + '.js')
    }
  }
}

// * This function is called from inside a position's iframe after the position's code has been injected
function postCodeInjection() {
  // masscast.initReload()

  function setAutoHeight() {
    setAutoHeight.times = setAutoHeight.times || 1
    // May not work as expected since the iframe content may not have been fully loaded yet...
    if (window.disableAutoHeight) {
      parent.log('Masscast', '"AutoHeight" is disabled for', frameElement.name)
      return frameElement.parentNode.style.height = 'auto'
    }

    masscast.adjustHeight()

    // ... so we do this VEEEEEERY UGLY hack to adjust height every 500ms until 4*500ms sec have passed - blame me.
    if (++setAutoHeight.times < 5) {
      setTimeout(setAutoHeight, 500)
    }
    else {
      parent.log('Masscast', frameElement.name, ' iframe height', frameElement.style.height)
    }
  }

  setTimeout(setAutoHeight, 150)
}


// * This function updates a position container with given positionCode USING AN IFRAME.
// * It remove anything in the container and create a brand new empty iframe
//   in which it will inject the positionCode.
function updatePositionViaIframe(position, positionCode) {

  log('Masscast', 'Update position code', position)

  var $item = $('#mc_' + position),
  positionClass = position

  if (!$item.length) return log('Masscast', 'Cannot update position via iframe, container not found for ', position)

  // real height will be set from inside of the iframe
  if ($item.data('default-height')) {
    // Set height to default-height if is defined in the masscast html parent's tag
    $item.css({height: $item.data('default-height')}).empty()
  }
  else {
    // Set position height to 0 in other cases
    $item.css({height: 0}).empty()
  }

  var $ad_iframe = $(
    '<iframe ' +
    'class="' + 'mc_' + positionClass + '_frame" ' +
    'name="mc_' + position + '" ' +
    'allowtransparency="true" framespacing="0" frameborder="no" scrolling="no"></iframe>'
  )

  $item.append($ad_iframe)

  var ad_document = $ad_iframe[0].contentDocument || $ad_iframe[0].contentWindow.document
  var preCodeInjectionStr = '<script>/*'+position+'*/(' + preCodeInjection.toString() + ')(window);</script>'
  var postCodeInjectionStr = function() {
    $ad_iframe[0].parentNode.style.height = 'auto'

    if($('body').hasClass('pg_video')) {
      if($ad_iframe[0].name === "mc_Top") {
        $ad_iframe[0].parentNode.parentNode.style.marginTop = '20px'
        $ad_iframe[0].parentNode.parentNode.style.marginBottom = '-20px'
      }
    }

    return '<script>(' + postCodeInjection.toString() + ')(window);</script>'
  }()

  if (positionCode.indexOf('OAS_HTML') === -1) {
    positionCode = '<script>' + positionCode + '</script>'
  }

  ad_document
    .open()
    .write(
      '<!DOCTYPE html><html><body><style>body { margin:0; padding: 0; text-align:center;}</style><div id="content">' +
      preCodeInjectionStr +
      positionCode +
      postCodeInjectionStr +
      '</div></body></html>'
    )

  if (position == 'Right') {
    $(window).trigger('resize')
    var resizeWin = function(){$(window).trigger('resize');}
    for (var i=0,a=[0,450,550,650,750],l=a.length;i<l;i++) {
      setTimeout(resizeWin,a[i])
    }
  }

  setTimeout(function(){ad_document.close()}, 0)
  // setTimeout(function(){ad_document.close();}, $.browser.name == 'msie' ? 2000 : 0)
}

export default {
  init: function(delay, videoId) {
    // expose global methods
    window.ping = ping

    setTimeout(function() {
      return request('GET', `/mc_call`)
        .send({
          referrer: document.referrer,
          video_id: videoId
        })
        .set('Accept', 'application/json')
        .end(function(err, callRes) {
          var callResJSON = JSON.parse(callRes.text)
          var call = callResJSON.call.replace('__RAND__', getRandParameter())
          getAdsFromOAS(call, (res) => {
            handlePositionCodes(parseOASResponse(res.text, callResJSON.positions))
          })
        })
    }, delay)
  }
}

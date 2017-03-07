require('_DM');
require('jquery');
require('jquery-ajax-setup');
require('DM_ResourcePlanner');
require('DM_PlayerEvents');
require('DM_PlayerV5Events');
require('js/lib/dm/ads/loggly.tracker.js');
require('js/lib/dm/skin.js');
require('js/lib/dm/ads/skin.js');

_DM.define('DM_Masscast', function ()
{
    var _self =
    {
        adminReports: [],
        readyForAdminReport: false,
        loaded_mcTop: false,
        refreshedMiddle: false,
        enabled: true,
        errorMsg: 'FAILED TO REQUEST OAS',
        startTime: new Date().getTime(),
        playerV5Id: 'player', // by default, player id is '#player' in views/macros/playerv5.html
        // "outframedPositions" represents positions that should / could be run out of any iframe.
        // x28 = custom js, is a custom js code generally written by an ad partner that could have a visual impact on any portion of a page
        //           like a custom skin.
        outframedPositions: ['x28','x29', 'Top3', 'x70'],
        // "assistedOutframedPositions" represents outframed positions that requires to be executed in a certain manner.
        // Other outframed positions can be run as is.
        // Exemple:
        //   - a Top3 requires an ajax call to get skin parameters and a call to a specific js function to be rendered.
        assistedOutframedPositions: ['Top3', 'x28'],

        // "locked" represents locked positions (aka position that won't be updated by OAS)
        locked: {
            'x29': true
        },
        // "hasMiddleAd" indicate if the middle position has content
        hasMiddleAd: false,
        // * This function prevents a position from being updated (if it hasn't already been)
        lockPosition: function(position)
        {
            log('Masscast', 'LOCK Position', position);
            _self.locked[position] = true;
        },
        // * This function builds the call URL to OAS, given a list of positions.
        //     - positions = ['Top','Middle', ...]
        getCallForPositions: function(positions)
        {

            var call = masscast_async_call;

            if (positions && positions.length)
            {
                // Update the positions' list in the URL (everything between "@" and "?").
                call = call.replace(/@.+\?/, '@' + positions.join(',') + '?');
            }

            // Update the random part of the URL (everything between "/" and "@") and return it.
            return call.replace(/\/[^\/]+@/, '/' + (new Date()).getTime() + '@');
        },
        // * This function makes the asynchronous call to OAS.
        // * If "positions" argument is provided, the call to OAS is made for given positions.
        //     - positions = ['Top','Middle', ...]
        // * This function expects a global variable "masscast_async_call" to be present. This variable will
        //     be used to make the first call to OAS. It will also be used to make all subsequent calls to OAS
        //     by updating the part of the url that contains the positions' list.
        callOAS : function(positions)
        {
            // DAILY-47416 : Force cross domain support by the $.get of jquery
            jQuery.support.cors = true;
            log('Masscast', 'callOAS - arguments :', positions);
            $
                .get(positions ? _self.getCallForPositions(positions) : masscast_async_call)
                .done(function(OASResponse)
                {
                    if (OASResponse == '// OAS_ERROR')
                    {
                        return log(
                            'Masscast',
                            'There was an error with OAS response. Possible reasons are: timeout, network error, OAS server error, ...'
                        );
                    }

                    if (positions && positions.length && positions.indexOf('Middle') !== -1)
                    {
                        _self.refreshedMiddle = true;
                    }
                    _self.callOASCallback(OASResponse, positions);
                })
                .fail(function(jqXHR, textStatus, errorThrown)
                {
                    log('Masscast', _self.errorMsg, textStatus, errorThrown);
                    _self.emitMasscastReport(
                      'error',
                      '<div><font color="red">' + _self.errorMsg + '.' +
                        ' Open JS console for details.' +
                        ' <a href="#" style="color: red;text-decoration: underline;"' +
                        ' onclick="showlog(\'Masscast\'); return false;">Print logs</a> (in JS console).' +
                        '</font></div>'
                    );
                });

        },
        // * This function parse the OAS response and returns a hash.
        //     Ex: {Middle: 'code', 'Right': 'code', ...}
        parseOASResponse: function(response, positions)
        {
            var positionCodes = {};

            // If only one positions has been required from OAS
            if (positions && positions.length == 1)
            {
                positionCodes[positions[0]] = response;
            }
            else
            {
                var splitted = response.split('<!--OAS AD="');
                if ($.trim(splitted[0]) === '') splitted.shift();
                if (splitted.length == 1)
                {
                    var positionNameMatch = masscast_async_call.match(/@(.+)\?/);
                    if (positionNameMatch)
                    {
                        positionCodes[positionNameMatch[1]] = splitted[0];
                    }
                }
                else
                {
                    for (var i = 0, l = splitted.length ; i < l ; i++)
                    {
                        var positionNameEnd = splitted[i].indexOf('"-->');
                        positionCodes[splitted[i].slice(0, positionNameEnd)] = $.trim(splitted[i].slice(positionNameEnd + 4)); // 4 = '"-->'.length
                    }
                }
            }

            return positionCodes;
        },
        // * This function is the callback of the OAS ajax call.
        // * ON DOM READY, It updates each position found in OASResponse by removing any existing iframe for the position
        //     and by creating a clean iframe in which the position code is injected.
        callOASCallback: function(OASResponse, positions)
        {
            log('Masscast', 'callOASCallback - OASResponse :', OASResponse);
            var positionCodes = _self.parseOASResponse(OASResponse, positions);

            log('Masscast', 'OASResponse parsed :', positionCodes);
            $(function()
            {
                _self.asyncHandlePositionCodes(positionCodes);
            });
        },
        asyncHandlePositionCodes: function(positionCodes)
        {
            setTimeout(function()
            {
                _self.handlePositionCodes(positionCodes);
            }, 200);
        },
        handlePositionCodes: function(positionCodes)
        {
            var outFramedHandler = function(position, positionCode)
            {
                log('Masscast', 'Position', position, ' is "outframed" and need to be run out of an iframe .');
                _self.handleOutframedPositionCode(position, positionCode);
                PubSub.publish('masscast:position_status', position, 'handled');
            };
            var inFramedHandler = function(position, positionCode)
            {
                _self.updatePositionViaIframe(position, positionCode);
                PubSub.publish('masscast:position_status', position, 'handled');
            };
            for (var position in positionCodes)
            {
                if (!positionCodes.hasOwnProperty(position)) continue; // just to be safe

                var positionCode = positionCodes[position];

                try
                {
                    var $item = $('#mc_' + position);
                    if (_self.locked[position])
                    {
                        log('Masscast', 'Position', position, 'is locked, update cancelled.');
                        continue;
                    }

                    // * hide position if :
                    //     - positionCode not present
                    //     - positionCode is "// Default ad"
                    if (!positionCode || positionCode.match(/\/\/ Default ad/))
                    {
                        $item.length && $item.empty().hide();
                        log('Masscast', 'Position', position, 'not found or empty, hide its container from page.');
                        PubSub.publish('masscast:position_status', position, 'dismissed');
                        continue;
                    }

                    ;
                    // Show container (if any) since there is a code for this position
                    $item.length && $item.removeClass('mc_hide');
                    if (position == 'Right' && window.DM_DisplayAds.adpositions.indexOf("Right"))
                    {
                        $('body').addClass('has-skyscraper');
                    }

                    // Is 'position' an outframed position?
                    if (
                            _self.outframedPositions.indexOf(position) > -1 &&
                            positionCode.indexOf('OAS_FORCE_IFRAME') === -1
                            // OAS_FORCE_IFRAME is a comment in the position code used for outframed positions
                            // that uses document.write in their code (hence not allowed to be outframed)
                            // and are able to run from inside a friendly iframe (ex: undertone via x28 or x70)
                            // OAS_FORCE_IFRAME have to be added by traffic team to the position code.
                    )
                    {
                        _self.handlePositionWith(position, positionCode, outFramedHandler);
                        continue;
                    }
                    else if (!$item.length)
                    {
                        log('Masscast', 'Position', position, ' container not found, do nothing.');
                        PubSub.publish('masscast:position_status', position, 'not_found');
                        continue;
                    }

                    // Render via iframe
                    _self.handlePositionWith(position, positionCode, inFramedHandler);
                }
                catch(e)
                {
                    log('Masscast', 'Exception catched while rendering', position, e.message);
                    PubSub.publish('masscast:position_status', position, 'error');
                }
            }
            //clear out locked positions after call is complete.
            _self.locked = {};
            if (_self.pixelleLoaded)
            {
                _self.lockPosition('x29');
            }
        },
        handlePositionWith: function(position, positionCode, handler)
        {
            setTimeout(function()
            {
                handler(position, positionCode);
            }, 100);
        },
        // * This function run the positionCode given OUT OF ANY IFRAME.
        // * The positionCode should not contain any document.write since the code will
        //     be run after dom ready in the context of the main window
        handleOutframedPositionCode: function(position, positionCode)
        {
            // If positionCode is a string, and we run it via eval.
            if($.isString(positionCode))
            {
                documentWriteBackup = document.write;
                document.write = function(content)
                {
                    log('Masscast', '!!! BEWARE !!!', position, 'tried to document.write on an already built page :', content);
                };

                _self.emitMasscastReport(
                  'position ' + position,
                  positionCode
                );

                // Code inspired from jquery globalEval, to execute javascript from a string in global context
                (window.execScript || function(positionCode)
                {
                    window["eval"].call(window, positionCode);
                })(positionCode);

                document.write = documentWriteBackup;
            }
            // We have no idea what to do with this position code...
            else
            {
                log('Masscast', 'cannot run position', position,  'code:', positionCode);
            }
        },
        // * This function updates a position container with given positionCode USING AN IFRAME.
        // * It remove anything in the container and create a brand new empty iframe
        //     in which it will inject the positionCode.
        updatePositionViaIframe: function(position, positionCode)
        {
            log('Masscast', 'Update position code', position);
            var $item = $('#mc_' + position),
            positionClass = position;

            if (!$item.length) return log('Masscast', 'Cannot update position via iframe, container not found for ', position);

            if (window.DM_Context.page_type === 'player_page' && position === 'x51')
            {
                $item.css('margin-right', '10px').addClass('pull-start');
            }

            // real height will be set from inside of the iframe
            if ($item.data('default-height'))
            {
                // Set height to default-height if is defined in the masscast html parent's tag
                $item.css({height: $item.data('default-height')}).empty();
            }
            else
            {
                // Set position height to 0 in other cases
                $item.css({height: 0}).empty();
            }

            var $ad_iframe = $(
                '<iframe ' +
                'class="' + 'mc_' + positionClass + '_frame" ' +
                'name="mc_' + position + '" ' +
                'allowtransparency="true" framespacing="0" frameborder="no" scrolling="no"></iframe>'
            );

            $item.append($ad_iframe);

            var ad_document = $ad_iframe[0].contentDocument || $ad_iframe[0].contentWindow.document;
            var preCodeInjection = '<script>/*'+position+'*/(' + _self.preCodeInjection.toString() + ')(window);</script>';
            var postCodeInjection = function()
            {
                $ad_iframe[0].parentNode.style.height = 'auto';

                if($('body').hasClass('pg_video'))
                {
                    if($ad_iframe[0].name === "mc_Top")
                    {
                        $ad_iframe[0].parentNode.parentNode.style.marginTop = '20px';
                        $ad_iframe[0].parentNode.parentNode.style.marginBottom = '-20px';
                    }
                }
		// removing the loaded check w.r.to the ticket DAILY-48111
                if(position !== 'Top' || position === 'Top')
                {
                    if(position === 'Top') _self.loaded_mcTop = true;
                    return '<script>(' + _self.postCodeInjection.toString() + ')(window);</script>';
                }

                return '';
            }();

            _self.emitMasscastReport(
              'position ' + position,
              positionCode
            );

            if (positionCode.indexOf('OAS_HTML') === -1)
            {
                positionCode = '<script>' + positionCode + '</script>';
            }

            ad_document
                .open()
                .write(
                    '<!DOCTYPE html><html><body><style>body { margin:0; padding: 0; text-align:center;}</style><div id="content">' +
                    preCodeInjection +
                    positionCode +
                    postCodeInjection +
                    '</div></body></html>'
                );
            if (position == 'Right' && !Pg_Video.supportRightFrame)
            {
                Pg_Video.supportRightFrame = true;
                $(window).trigger('resize');
                var resizeWin = function(){$(window).trigger('resize');};
                for (var i=0,a=[0,450,550,650,750],l=a.length;i<l;i++)
                {
                    setTimeout(resizeWin,a[i]);
                }
            }

            setTimeout(function(){ad_document.close();}, $.browser.name == 'msie' ? 2000 : 0);
        },
        // * This function reloads a specific position. It takes as only argument
        //     the iframe or the iframe's window of the position you want to reload.
        // * This function is called by the position's iframe itself when its reload time is reached.
        reloadPositionFrame: function(frame)
        {
            if (!_self.enabled)
            {
                log('Masscast', 'Masscast has been DISABLED, no reload allowed for', frame.name);
                return;
            }
            log('Masscast', 'reloadPositionFrame - frame name', frame.name);
            var position = frame.name.replace(/mc_([a-zA-Z0-9]+)/, '$1');
            log('Masscast', 'Frame position to reload:', position);
            _self.callOAS([position]);
        },

        //////////////////////////////////// IFRAME INJECTED CODE ///////////////////////////////////////////////

        // * This function is called from inside a position's iframe and
        //     set object masscast to allow call of other positions than the iframe's default.
        // * This function also __initialize:
        //     - the reload of the position if it was provided in the OAS position code (via "var reloadTime = 60;" for example).
        //     - the onload iframe event to adjust height for example
        preCodeInjection: function(frame)
        {
            frame.masscast_async_call = parent.masscast_async_call;
            frame.inDapIF = true;

            frame.ping = parent.ping;

            if (window.performance && performance.getEntries && typeof parent.adRequestsTotal != 'undefined')
            {
                frame.parent.log('Masscast', 'Start watching requests of', frame.name);

                frame.lastRequestsTotal = 0;
                frame.lastFramesTotal = 0;
                // every 5 secs update counter of # requests and # frames
                frame.requestWatcher = setInterval(function()
                {
                    var requestsTotal = performance.getEntries().length;
                    var iframesTotal = document.getElementsByTagName('iframe').length;

                    frame.parent.adRequestsTotal += requestsTotal - frame.lastRequestsTotal;
                    frame.parent.adFramesTotal += iframesTotal - frame.lastFramesTotal;
                    frame.lastRequestsTotal = requestsTotal;
                    frame.lastRequestsTotal = iframesTotal;

                    if (!frame.parent.DM_Masscast.enabled)
                    {
                        frame.parent.log('Masscast', 'Stop watching requests of', frame.name);
                        clearInterval(frame.requestWatcher);
                    }
                }, 5000);
            }

            frame.masscast =
            {
                initReload: function()
                {
                    if (frame.reloadTime && frame.parent.DM_Masscast)
                    {
                        frame.parent.log('Masscast', 'Frame reload initiated for', frame.name, '. Reload in', reloadTime, 'secs.');

                        frame.parent.DM_Masscast.emitMasscastReport(
                          'position:reload',
                          frame.name.replace('mc_', '') + ':' + reloadTime
                        );

                        setTimeout(
                            function()
                            {
                                frame.parent.DM_Masscast.reloadPositionFrame(frame);
                            },
                            reloadTime * 1000
                        );
                    }
                },
                getElementHeight: function(el)
                {
                    return parseInt(parent.$(el).css('height'), 10);
                },
                adjustHeight: function(h)
                {
                    var contentHeight = masscast.getElementHeight(document.getElementById('content')),
                        bodyHeight = masscast.getElementHeight(document.body),
                        parentFrameHeight = masscast.getElementHeight(frameElement.parentNode),
                        height =
                            (h || 0) ||
                            contentHeight;

                    // if a height param was provided, force #content to occupy full width and height of the iframe
                    if (h) document.getElementById('content').style.cssText += 'position:absolute;top:0;bottom:0;left:0;right:0;';

                    frameElement.style.height = height + 'px';
                    frameElement.parentNode.style.height = 'auto';

                    // If iframe has no significant height (height < 50) and iframe parent has signifiacant height (> 100)
                    // then ad display is probably not inside the iframe but inside its parent.
                    // Then we should hide the iframe to prevent any extra spaces to be visible.
                    if (height < 50 && parentFrameHeight >= 100 && frameElement.name.indexOf("x70") == -1)
                    {
                        frameElement.style.display = 'none';
                    }
                    else if (frameElement.name.indexOf("x52") != -1)
                    {
                        frameElement.style.display = 'auto';
                        frameElement.style.height = '254px';
                    }
                    else
                    {
                        frameElement.style.display = 'block';

                        // Last height adjustment, if ad content is not in #content but in body.
                        if (height < 50 && bodyHeight >= 100)
                        {
                            frameElement.style.height = bodyHeight + 'px';
                        }
                    }
                },
                // Supposed to load a js that works "alone"
                loadDmJs: function(src)
                {
                    var s = frame.document.createElement('script');
                    s.type = 'text/javascript';
                    s.src = frame.parent.DM_JS.getRealPath(src); // get versioned path
                    s.async = true;
                    frame.document.body.appendChild(s);
                },
                render: function(name, params)
                {
                    frame[name + 'Parameters'] = params;
                    masscast.loadDmJs('/js/lib/dm/masscast/iframed/' + name + '.js');
                }
            };
        },
        // * This function is called from inside a position's iframe after the position's code has been injected
        postCodeInjection: function()
        {
            masscast.initReload();

            function setAutoHeight()
            {
                setAutoHeight.times = setAutoHeight.times || 1;
                // May not work as expected since the iframe content may not have been fully loaded yet...
                if (window.disableAutoHeight)
                {
                    parent.log('Masscast', '"AutoHeight" is disabled for', frameElement.name);
                    return frameElement.parentNode.style.height = 'auto';
                }

                masscast.adjustHeight();

                // ... so we do this VEEEEEERY UGLY hack to adjust height every 500ms until 4*500ms sec have passed - blame me.
                if (++setAutoHeight.times < 5)
                {
                    setTimeout(setAutoHeight, 500);
                }
                else
                {
                    parent.log('Masscast', frameElement.name, ' iframe height', frameElement.style.height);
                }
            }

            setTimeout(setAutoHeight, 150);
        },

        //////////////////////////////////// END IFRAME INJECTED CODE ///////////////////////////////////////////////
        disable: function()
        {
            log('Masscast', 'Masscast DISABLE');
            _self.enabled = false;
        },
        middleAdPresent: function() {
            return ($('div[id^="mc_"]').length > 0 && $('#mc_Middle').children().length > 0);
        },
        setupTracker: function() {
            _LTracker.push({
                'logglyKey': 'd6464acb-25b8-4dd2-bf83-64fed1a15e10',
                'sendConsoleErrors' : true,
                'tag': 'jslogger'
            });
        },
        trackPosition: function(position, moment) {
            var curTime = new Date().getTime();
            _LTracker.push({
                'dmxtrk': {
                    'display_server': 'oas',
                    'ad_position': position,
                    'moment' : moment,
                    'refresh' : 0,
                    'country' : window.DM_Context.geoip_country,
                    'latency' : _self.getLatency(curTime)
                }
            });
        },
        getLatency: function(currTime) {
            if(currTime >= _self.startTime)
                return (currTime - _self.startTime);
            return 0;
        },
        init: function()
        {

            PubSub.subscribe('pixelle-loaded', function()
            {
                _self.pixelleLoaded = true;
            });
            PubSub.subscribe('pixelle-not-loaded', function()
            {
                _self.pixelleLoaded = false;
                _self.callOAS(['x29']);
            });

            //DAILY-40540
            //Call masscast right away will middle position locked if it is player page
            if(window.DM_Context.page_type == 'player_page')
            {
                if (_self.canCallOAS())
                {
                    _self.lockPosition('Middle');
                    DM_ResourcePlanner.add(
                            'ad',
                            function()
                            {
                                _self.callOAS();
                            }
                    );
                }
                // PE : Waiting for use player events to determin if there is a LR/Auditude companion or not. Uncomment when it will be set.

                // On 'ad_start' event, after 1 second, make an OAS call if a preroll is present without companion ad (if no code has been injected to mc_Middle).
                // Also, tell to masscast that an OAS call has already been made to not do it when video will start playing.
                var timeOut = null;
                DM_PlayerV5Events.on('ad_start', _self.playerV5Id, function()
                {
                    timeOut = setTimeout(function()
                    {
                        if (_self.canCallOAS())
                        {
                            //Can call OAS but block middle.
                            if(!_self.middleAdPresent())
                            {
                                _self.locked = {};
                                if (_self.pixelleLoaded)
                                {
                                    _self.lockPosition('x29');
                                }
                                _self.callOAS(['Middle']);
                            }
                        }
                    }, 1000);
                });

                // When video start playing, we check that am OAS call havn't already been made.
                DM_PlayerV5Events.on('playing', _self.playerV5Id, function()
                {
                    if(timeOut !== null)
                    {
                        clearTimeout(timeOut);
                    }
                    if (_self.canCallOAS())
                    {
                        if (window.DM_Context.geoip_country != 'us' || !_self.middleAdPresent())
                        {
                            _self.locked = {};
                            if (_self.pixelleLoaded)
                            {
                                _self.lockPosition('x29');
                            }
                            if (!_self.refreshedMiddle)
                            {
                                _self.callOAS(['Middle']);
                            }
                        }
                    }
                });
            }
            else if (window.DM_Context.page_type.toLowerCase() === 'user' || window.DM_Context.page_type.toLowerCase() === 'bookmarks')
            {
                return;
            }
            else if (_self.canCallOAS())
            {
                _self.callOAS();
            }
        },
        canCallOAS: function()
        {
            // DAILY-52807
            if ((window.DM_Context.geoip_country === 'us' && window.DM_Context.traffic_segment >= 50 && window.DM_Context.traffic_segment <= 55) ||
                ((window.DM_Context.geoip_country === 'nl' || window.DM_Context.geoip_country === 'ru' || window.DM_Context.geoip_country === 'po') && window.DM_Context.traffic_segment >= 50 && window.DM_Context.traffic_segment <= 100))
            {
                return false;
            }
            if (window.DM_Context.video_ads === false || window.videolist_has_ads === false)
            {
                log('Masscast', 'window.DM_Context.video_ads is false, blocking ads', window.DM_Context.video_ads);
                return false;
            }
            return true;
        },

        // Add messages in admin panel "masscast call" section.
        emitMasscastReport: function(type, content)
        {
            var ts = +new Date();
            if (_self.readyForAdminReport)
            {
                PubSub.publish('masscast:reports', [[ts, type, content]]);
            }
            else
            {
                _self.adminReports.push([ts, type, content]);
            }
        },

        getRandParameter: function()
        {
            var max = 99999999998;
            var min = max/2;

            return Math.floor(Math.random() * (max - min)) + min;
        },

        initialize: function()
        {
            var rand = _self.getRandParameter();

            if (window.masscast_async_ads1_call)
            {
                masscast_async_ads1_call = masscast_async_ads1_call.replace('__RAND__', rand);
            }
            if (window.masscast_async_call)
            {
                masscast_async_call = masscast_async_call.replace('__RAND__', rand);

                log('Masscast', 'window.masscast_async_call found', window.masscast_async_call);
                if(DM_Context.rebuffer_not_allowed === false)
                {
                    PubSub.subscribe('player:rebuffer', function()
                    {
                        log('Masscast', 'Player rebuffer catched');
                        _self.disable();
                    });
                }

                // This object holds the "public" functions callable by traffic team to render positions developed by DM.
                // It is injected in main page.
                window.masscast =
                {
                    render: function(name, params)
                    {
                        // This position requires an assisted execution, we don't run it, we only "inform" whatever concerned component that a code is
                        // available for this position (via PubSub.publish)
                        log('Masscast', 'publish', name, 'code for assisted handling');
                        PubSub.publish('masscast:position_' + name, params);
                    }
                };

                _self.init();
            }
            else
            {
                log('Masscast', 'window.masscast_async_call not found.');
            }
        },
        __initialize: function()
        {
            if (window.DM_Context.page_type === 'player_page')
            {
                // DAILY-51837 (check WhiteOps)
                DM_ResourcePlanner.add('stat', function() {
                    var url = 'https://s.acexedge.com/2/259849/analytics.js?';
                    var params = {
                        c2: window.DM_Context.geoip_country,
                        di: window.DM_Context.domain,
                        c3: window.DM_Context.video_is_verified || false,
                        cr: window.DM_Context.video_id || '',

                        dm: window.DM_Context.d || '', // Width and height of the player (if available)
                        cb: window.DM_Context.view_id || '',

                        ai: window.DM_Context.user_login || '', // Account ID (video owner ID)
                        ui: window.DM_Context.v1st, // Unique User ID from DM (V1st)

                        bt: 'programmatic',
                        md: 'video',
                        c1: 'DMdirect',
                        dt: '2598491450274106527001'
                    };
                    var context = {
                        currentUrl: window.location.href,
                        referer: document.referrer,
                        route: window.DM_Context.route_name,
                        deviceType: window.DM_Context.device
                    };

                    ajax_call('video', 'get_video_ads_decision', window.DM_Context.video_id, JSON.stringify(context), function(response) {
                        var o = 'script',
                            m = document.getElementsByTagName(o)[0],
                            a = document.createElement(o);

                        response = $.parseJSON(response);

                        if (response.globalStatus) {
                            // Get status and reason ID from get_video_ads_decision
                            params.c7 = response.globalStatus.status || '';
                            params.c8 = response.globalStatus.reason_id || '';
                        } else {
                            params.c7 = '';
                            params.c8 = '';
                        }

                        url += $.param(params);
                        a.async = 1;
                        a.src = url;
                        m.parentNode.insertBefore(a, m);
                    });
                });
            }

            PubSub.subscribe('adminpanel:loaded', function()
            {
                if (_self.adminReports.length)
                {
                    PubSub.publish('masscast:reports', _self.adminReports);
                    _self.adminReports = [];
                }
                _self.readyForAdminReport = true;
            });
        }
    };

    return _self;
}, true);

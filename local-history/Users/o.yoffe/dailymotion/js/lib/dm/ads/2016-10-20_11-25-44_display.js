require('_DM');
require('jquery');
require('jquery-ajax-setup');
require('js/lib/dm/ads/dfp.gpt.logger.override.js');
require('js/lib/dm/ads/loggly.tracker.js');
require('DM_ResourcePlanner');
require('DM_PlayerEvents');
require('DM_PlayerV5Events');

_DM.define('DM_DisplayAds', function()
{
    var _self = {

        hasCompanionAd: false,
        startTime: new Date().getTime(),
        playerV5Id: 'player', // by default, player id is '#player' in views/macros/playerv5.html
        adunits:
        [
            {'pos':'Top','id':'div-gpt-ad-1422660696836-2','name':'Top_728x90','dimensions':[[1,1],[728,90]]},
            {'pos':'Bottom','id':'div-gpt-ad-1422660696836-0','name':'Bottom_728x90','dimensions':[728,90]},
            {'pos':'X02','id':'div-gpt-ad-1422660696836-3','name':'X02_300x250','dimensions':[300,250]},
            {'pos':'X51','id':'div-gpt-ad-1422660696836-3','name':'X51_300x250','dimensions':[300,250]},
            {'pos':'X52','id':'div-gpt-ad-1422660696836-4','name':'X52_300x250','dimensions':[300,250]},
            {'pos':'InterstitialOPP','id':'div-gpt-ad-1426543907758-2-oop','name':'InterstitialOPP','dimensions':[1, 1]},//, [320, 480], [482, 320], [768, 1024], [1024, 768]]},
            {'pos':'Middle','id':'div-gpt-ad-1422660696836-1','name':'Middle_300x250','dimensions':[300,250]},
            {'pos':'x01','id':'div-gpt-ad-1422660696836-1','name':'x01_300x250','dimensions':[300,250]},
            {'pos':'Right','id':'div-gpt-ad-1426543907758-4','name':'Right_160x600','dimensions':[160,600]},
            {'pos':'Skin','id':'div-gpt-ad-1426543907758-5','name':'Skin','dimensions':[[1,1],[320,480],[482,320],[768,1024],[1024,768]]}
        ],
        adpositions: window.adpositions ? window.adpositions : null,
        gptInitialized: false,

        initialize: function()
        {
            var googletag = googletag || {};
            googletag.cmd = googletag.cmd || [];
            (function() {
                var gads = document.createElement('script');
                gads.async = true;
                gads.type = 'text/javascript';
                var useSSL = 'https:' == document.location.protocol;
                gads.src = (useSSL ? 'https:' : 'http:') + '//www.googletagservices.com/tag/js/gpt.js';
                var node = document.getElementsByTagName('script')[0];
                node.parentNode.insertBefore(gads, node);
            })();

            window.googletag = googletag;

            // For DM Specific Posiitons, keeping the name masscast temporarily
            window.masscast =
            {
                render: function(name, params)
                {
                    log('Masscast', 'publish', name, 'code for assisted handling');
                    PubSub.publish('masscast:position_' + name, params);
                }
            };


            if(_self.canCallAds() === true )
            {

                if(googletag) _self.gptInitialized = true;

                // For the latency test
                if(typeof window.DM_Context !== 'undefined' && window.DM_Context.dfp_measured === true)
                {
                    var _LTracker = _LTracker || [];
                    _self.setupTracker();
                }

                if(_self.adpositions)
                {
                    _self.callAds(_self.adpositions);
                }
            }
        },
        canCallAds: function()
        {
            if (typeof window.DM_Context.video_ads !== 'undefined' || typeof window.DM_Context.videolist_has_ads !== 'undefined')
            {
                if (window.DM_Context.video_ads === false || window.videolist_has_ads === false)
                {
                    return false;
                }
            }
            return true;
        },
        callAds: function(positions) {
            if(_self.gptInitialized === true && typeof googletag !== 'undefined')
            {
                googletag.cmd.push(function(){
                    googletag.on('gpt-google_js_loaded', function(){
                        _self.trackPosition(null,'adcall_start');
                    });
                });
            }
            var posMiddle = [];

            if(positions.indexOf('Middle') > -1) { posMiddle = positions.splice(positions.indexOf('Middle'),1);}
            if(positions.indexOf('x01') > -1) { posMiddle = positions.splice(positions.indexOf('x01'),1);}
            // Create Ad Slots
            for(var i=0;i<positions.length;i++) {
                for(var j=0; j<_self.adunits.length;j++)
                {
                    if(positions[i] == _self.adunits[j].pos)
                    {
                        _self.createAdSlot(_self.adunits[j].id, _self.adunits[j].name, _self.adunits[j].dimensions);
                    }
                }
            }
            _self.enableAsyncLoad();
            _self.enableServices(0);

            // Test player page events to check for companion ad
            if(window.DM_Context.page_type === 'player_page')
            {
                var timeOut = null;
                DM_PlayerV5Events.on('ad_start', _self.playerV5Id, function()
                {
                    timeOut = setTimeout(function()
                    {
                        if(!_self.companionAdPresent() && posMiddle.indexOf('Middle') > -1 )
                        {
                            _self.createAdSlot('div-gpt-ad-1422660696836-1','Middle_300x250',[300,250]);
                            _self.enableServices(1);
                            $('#div-gpt-ad-1422660696836-1').css('margin-bottom',10);
                            if(typeof DM_Context !== 'undefined' && DM_Context.dfp_measured === true && typeof DM_Context.dfp_measured !== 'undefined')
                                _self.trackAdRender('Middle');
                        }
                        if(!_self.companionAdPresent() && posMiddle.indexOf('x01') > -1 )
                        {
                            _self.createAdSlot('div-gpt-ad-1422660696836-1','x01_300x250',[300,250]);
                            _self.enableServices(1);
                            $('#div-gpt-ad-1422660696836-1').css('margin-bottom',10);
                            if(typeof DM_Context !== 'undefined' && DM_Context.dfp_measured === true && typeof DM_Context.dfp_measured !== 'undefined')
                                _self.trackAdRender('x01');
                        }
                    },1000);
                });

                DM_PlayerV5Events.on('playing', _self.playerV5Id, function()
                {
                    if(timeOut !== null)
                        clearTimeout(timeOut);

                    if ((window.DM_Context.geoip_country !== 'us' || !_self.companionAdPresent()) && posMiddle.indexOf('Middle') > -1)
                    {
                        _self.createAdSlot('div-gpt-ad-1422660696836-1','Middle_300x250',[300,250]);
                        _self.enableServices(1);
                        $('#div-gpt-ad-1422660696836-1').css('margin-bottom',10);
                        if(typeof DM_Context !== 'undefined' && DM_Context.dfp_measured === true && typeof DM_Context.dfp_measured !== 'undefined')
                            _self.trackAdRender('Middle');
                    }
                    if ((window.DM_Context.geoip_country !== 'us' || !_self.companionAdPresent()) && posMiddle.indexOf('x01') > -1)
                    {
                        _self.createAdSlot('div-gpt-ad-1422660696836-1','x01',[300,250]);
                        _self.enableServices(1);
                        $('#div-gpt-ad-1422660696836-1').css('margin-bottom',10);
                        if(typeof DM_Context !== 'undefined' && DM_Context.dfp_measured === true && typeof DM_Context.dfp_measured !== 'undefined')
                            _self.trackAdRender('x01');
                    }
                });
            }
            else if(posMiddle.indexOf('Middle') > -1)
            {
                _self.createAdSlot('div-gpt-ad-1422660696836-1','Middle_300x250',[300,250]);
                _self.enableServices(1);
            }
            else if(posMiddle.indexOf('x01') > -1)
            {
                _self.createAdSlot('div-gpt-ad-1422660696836-1','x01_300x250',[300,250]);
                _self.enableServices(1);
            }

            _self.trackPosition(null,'pageload_complete');
            _self.trackAdRender('Top',728,90);
            _self.trackAdRender('Bottom',728,90);
            _self.trackAdRender('x01',300,250);
            _self.trackAdRender('X02',300,250);
            _self.trackAdRender('X51',300,250);
            _self.trackAdRender('X52',300,250);

        },
        createAdSlot: function(slotId, slotName, dimensions)
        {
            var curSlot;
            googletag.cmd.push(function()
            {
                if (slotName.indexOf('OPP') !== -1) {
                    // Out of page ad slots
                    curSlot = googletag.defineOutOfPageSlot('/23328537/'+slotName, slotId).addService(googletag.pubads());
                }
                else
                {
                    curSlot = googletag.defineSlot('/23328537/'+slotName,dimensions,slotId).addService(googletag.pubads());
                    $('#'+slotId).height(dimensions[1]);
                }
                googletag.pubads().addEventListener('slotRenderEnded', function(event) {
                    if(event.slot == curSlot)
                    {
                        _self.trackPosition(slotName.split('_')[0].toLowerCase(),'adcall_response');
                    }
                });
            });
        },
        enableAsyncLoad: function()
        {
            if(_self.gptInitialized === true && typeof googletag !== 'undefined')
            {
                googletag.cmd.push(function()
                {
                    //For single page load
                    googletag.pubads().enableSingleRequest();
                    googletag.pubads().collapseEmptyDivs();
                });
            }
        },
        enableServices: function(pos)
        {
            if(_self.gptInitialized === true && typeof googletag !== 'undefined')
            {
                googletag.cmd.push(function(){
                    googletag.enableServices();
                    googletag.display('div-gpt-ad-1422660696836-' + pos);
                });
            }
        },
        getElementHeight: function(el)
        {
            return parseInt(parent.$(el).css('height'), 10);
        },
        customizeElement: function(id) {
            var adElement = document.getElementById(id);
            if(window.disableAutoHeight) {
                adElement.style.height = 'auto';
            }
        },
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
            _self.loadDmJs('/js/lib/dm/ads/' + name + '.js');
            _self.loadDmJs('/js/lib/dm/skin.js');
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
            if (typeof DM_Context !== 'undefined' && DM_Context.dfp_measured === true && _LTracker && typeof DM_Context.dfp_measured !== 'undefined')
            {
                _LTracker.push({
                    'dmxtrk': {
                        'display_server': 'dfp',
                        'ad_position': position,
                        'moment' : moment,
                        'refresh' : 0,
                        'country' : window.DM_Context.geoip_country,
                        'latency' : _self.getLatency(curTime)
                    }
                });
            }
        },
        getLatency: function(currTime) {
            if(currTime >= _self.startTime)
                return (currTime - _self.startTime);
            return 0;
        },
        trackAdRender: function(adPosition,width,height)
        {
            if(_self.gptInitialized === true && typeof googletag !== 'undefined')
            {
                googletag.cmd.push(function(){
                    googletag.on('gpt-page_load_complete',function(){
                        var id = '"google_ads_iframe_/23328537/'+adPosition+'_'+width+'x'+height+'"';
                        var frameElement = document.querySelector('iframe[id^='+id+']');
                        if(frameElement)
                        {
                            var iframeDoc = frameElement.contentDocument || frameElement.contentWindow.document;
                            if (iframeDoc.readyState  == 'complete')
                            {
                                _self.trackPosition(adPosition.toLowerCase(),'adcall_render');
                                console.log( frameElement.id,' IFRAME fully loaded and parsed');
                            }
                        }
                    });
                });
            }
        },
        companionAdPresent: function() {
            return ($('div[id^="mc_"]').length > 0 && ($('#mc_Middle').children().length > 0 || $('#mc_x01').children().length > 0 ));
        }
    };

    return _self;
},true);

<?php

/*****************************************************************************************************
*
*   MASSCAST - based on original masscast by Manu
*   ---------------------------------------------
*
*   1/ create a 1st masscast object set a location and add elements to it:
*       - Location is the page we are on (usefull for sales)
*       - Elements are the positions you want
*
*   2/ Create derivated widget for each position and add them to the page
*
*   3/ Generate the call to oas
*
*****************************************************************************************************/

class DM_WidgetV3_PageItem_Masscast extends DM_WidgetV3
{
    static $AUTO_SCRIPT = false; // the masscast script is included in mandatory.js so it can be on the top of the page

    // use the setter if you want to overwrite default values that getCall will generate
    private $location =             null;           // only for MAIN masscast
    private $referer =              null;           // only for MAIN masscast
    private $explicit =             false;          // only for MAIN masscast
    private $isNoAdFit =            false;          // only for MAIN masscast
    private $isExternal =           false;          // only for MAIN masscast
    private $type       =           '';
    private $doAdCall   =           true;

    private $js = array
    (
        'top'    => array(),
        'bottom' => array()
    );

    // if you change the value of $noFrame,
    // also change $mc_no_frame in
    // lib/DM/WidgetV3/PageItem/Header.php
    private $noFrame=               true;           // only for MAIN masscast

    private $section =              null;           // only for MAIN masscast
    private $channel =              null;           // only for MAIN masscast
    private $video =                null;           // only for MAIN masscast
    private $reloadTime =           null;           // only for DERIVATED masscast
    private $reloadMaxDuration =    null;           // only for DERIVATED masscast

    private $owner =                null;           // the owner of the video or group or playlist
    private $call =                 null;           // contains the generated call
    private $callAds1 =             null;
    //private $callAds2 =             null;
    private $DMSite =               '';
    private $DMSection =            '';
    private $DMPage =               '';
    protected $parameters =         array();        // list of all call's uri params
    private $cloneFather =          null;           // if I am a clone this is the reference to the masscast that created me
    private $position =             null;           // of wich position the cloned masscast is
    private $element =              array();        // list of the positions main masscast will specify in the call
    private $overload =             array();        // list of the positions masscast has to skeep during the call and replace by some content
    private $isClone =              false;          // if true we are in a clone widget
    private $cookieData =           array();        // cookie data retriewed from request

    // allowed positon you can use with addElement
    private $allowedElement = array ('Middle', 'Top', 'Top3', 'Right', 'x28', 'x29','x30', 'x69', 'x70', 'Bottom', 'BottomRight','x51','x52','x53');

    if (DM_GateKeeper::match('DISPLAYADS_VIDEOPAGE_B', r()))
    {
        $allowedElement = array ('Middle', 'Top', 'Top3', 'Right', 'x28', 'x29','x30', 'x69', 'x70', 'Bottom', 'BottomRight','x51','x52','x53');
    }
    elseif (DM_GateKeeper::match('DISPLAYADS_VIDEOPAGE_C', r()))
    {
        $allowedElement = array ('Middle', 'Top', 'Top3', 'Right', 'x28', 'x29','x30', 'x69', 'x70', 'Bottom', 'BottomRight','x51','x52','x53');
    }

    // allowed position you can use to get a derivated
    private $allowedDerivated = array ('Middle', 'Top', 'Right', 'x28','x29', 'x30', 'Bottom', 'Bottomright', 'x70');

    protected function __construct()
    {
        parent::__construct();

        $this->cookieData = json_decode(urldecode(r()->getCookie('mc')), true);
    }

    public function cancelAdCall()
    {
        $this->doAdCall = false;

        return $this;
    }

    // return true if the widget is a clone
    protected function checkIsClone()
    {
        if(!$this->isClone)
        {
            throw new DM_WidgetV3_PageItem_Masscast__Exception('cannot use this setter / getter on a non derivated');
        }
    }

    // return true if the widget is not a clone
    protected function checkNotClone()
    {
        if($this->isClone)
        {
            throw new DM_WidgetV3_PageItem_Masscast__Exception('cannot use this setter / getter on a derivated');
        }
    }

    protected function saveCookieParam($name, $value)
    {
        $this->cookieData[$name] = $value;
    }

    protected function hasCookieParam($name)
    {
        return isset($this->cookieData[$name]);
    }

    protected function getCookieParam($name)
    {
        if (isset($this->cookieData[$name]))
        {
            return $this->cookieData[$name];
        }
        return false;
    }

    protected function removeCookieParam($name)
    {
        if (isset($this->cookieData[$name]))
        {
            unset($this->cookieData[$name]);
        }
    }

    /******************************
    *
    *   GETTER / SETTER
    *
    ******************************/

    // use this function to add positions when setuping the main masscast
    public function addElement($element)
    {
        if ($this->isClone)
        {
            throw new DM_WidgetV3_PageItem_Masscast__Exception('cannot add element to a clone');
        }
        else if (!in_array($element, $this->allowedElement))
        {
            throw new DM_WidgetV3_PageItem_Masscast__Exception('element not allowed: ' . $element);
        }
        $this->element[] = $element;
        return $this;
    }

    // get element list
    public function getElement()
    {
        return $this->element;
    }

    public function removeElement($element)
    {
        foreach ($this->element as $k => $v)
        {
            if ($v == $element)
            {
                unset($this->element[$k]);
                break;
            }
        }
    }

    // return derivated's position
    public function getPosition()
    {
        $this->checkIsClone();

        if (!$this->position)
        {
            throw new DM_WidgetV3_PageItem_Masscast__Exception('Masscast position is not set');
        }
        return $this->position;
    }

    // set derivated's position (done by getDerivated)
    public function setPosition($position)
    {
        $this->checkIsClone();

        if (!in_array($position, $this->allowedDerivated))
        {
            throw new DM_WidgetV3_PageItem_Masscast__Exception('derivated ' . $position . ' is not allowed');
        }
        $this->position = $position;
        return $this;
    }

    private function getReloadMaxDurationForPosition($position)
    {
        return DM_Config::getValue('MASSCAST_DEFAULT_RELOAD_DURATION_' . strtoupper($position));
    }

    // return derivated's reload max duration, uses default conf's value if not set
    public function getReloadMaxDuration()
    {
        $this->checkIsClone();

        if (!$this->reloadMaxDuration)
        {
            $this->reloadMaxDuration = DM_Config::getValue('MASSCAST_DEFAULT_RELOAD_DURATION_' . $this->getReloadMaxDurationForPosition($this->getPosition()));
        }
        return $this->reloadMaxDuration;
    }

    // set derivated's reload max duration
    public function setReloadMaxDuration()
    {
        $this->checkIsClone();
        $this->reloadMaxDuration = $int;
        return $this;
    }

    private function getReloadTimeForPosition($position)
    {
        return  DM_Config::getValue('MASSCAST_DEFAULT_RELOADTIME_' . strtoupper($position));
    }

    // return derivated's reload time, uses default conf value if not set
    public function getReloadTime()
    {
        $this->checkIsClone();

        if ($this->reloadTime)
        {
            return $this->reloadTime;
        }

        return $this->reloadTime = $this->getReloadTimeForPostion($this->getPosition());
    }

    // set derivated's reload time
    public function setReloadTime($int)
    {
        $this->checkIsClone();
        $this->reloadTime = $int;
        return $this;
    }

    // return a clone of the main masscast widget
    // use it to get widgets to be placed in your page has masscast positions
    public function getDerivated($position)
    {
        if ($this->isClone)
        {
            throw new DM_WidgetV3_PageItem_Masscast__Exception('cannot get a derivated from a derivated');
        }

        $clone = clone $this;

        $clone->cloneFather =& $this;
        $clone->isClone = true;
        $clone->setPosition($position);

        return $clone;
    }

    public function getChannel()
    {
        if (is_null($this->channel))
        {
            $this->channel = $this->getRequest()->getPageChannel();

            if (!$this->channel && $video = $this->getVideo())
            {
                $this->channel = $video->getChannel();
            }
        }

        return $this->channel;
    }

    // getter and serter that can be used on main widget
    protected   function getExplicit()      {return $this->explicit;}
    protected   function isExternal()       {return $this->isExternal;}
    protected   function getType()          {return $this->type;}
    protected   function getLocation()
    {
        if (!is_null($this->location))
        {
            return $this->location;
        }
        return $this->getRequest()->getRouteName();
    }
    public   function isNoFrame()        {return $this->noFrame;}

    private static function comesFromSearchEngine(DM_Request $request)
    {
        $referer = $request->getReferer();
        return strpos($referer, '://www.bing.') || strpos($referer, '://www.google.');
    }

    protected function getOverloadContent($elementName)
    {
        return $this->overload[$elementName];
    }

    protected function isOverloadElement($elementName)
    {
        return array_key_exists($elementName, $this->overload);
    }

    public function setNoFrame($bool = true)
    {
        $this->checkNotClone();
        $this->noFrame = $bool;
        return $this;
    }

    public function setExplicit($bool = true)
    {
        $this->checkNotClone();
        $this->explicit = $bool;
        return $this;
    }

    public function setType($type = '')
    {
        $this->checkNotClone();
        $this->type = $type;
        return $this;
    }

    public function setIsNoAdFit($bool = true)
    {
        $this->checkNotClone();
        $this->isNoAdFit = $bool;
        return $this;
    }

    public function setIsExternal($bool = true)
    {
        $this->checkNotClone();
        $this->isExternal = $bool;
        return $this;
    }

    public function setDMPage($string)
    {
        $this->checkNotClone();
        $this->DMPage = $string;
        return $this;
    }

    public function setSection($string)
    {
        $this->checkNotClone();
        $this->section = $string;
        return $this;
    }

    public function setChannel($string)
    {
        $this->checkNotClone();
        $this->channel = strtolower($string);
        return $this;
    }

    public function setLocation($string)
    {
        $this->checkNotClone();
        $this->location = $string;
        return $this;
    }

    public function overloadElement($name, $content = '')
    {
        $this->overload[$name] = $content;
    }

    public function getOwner()
    {
        if (!isset($this->owner))
        {
            $this->owner = false;

            $request = $this->getRequest();
            $video   = $this->getVideo();

            if ($request->getRouteName() == 'external_widget' && r()->hasObjectParameter('video'))
            {
                $this->owner = r()->getObjectParameter('video')->getOwner();
            }
            else if ($request->hasObjectParameter('video'))
            {
                $this->owner = $request->getObjectParameter('video')->getOwner();
            }
            else if ($request->hasObjectParameter('user'))
            {
                $this->owner = $request->getObjectParameter('user');
            }
            else if ($request->hasObjectParameter('group'))
            {
                $this->owner = $request->getObjectParameter('group')->getOwner();
            }
            elseif ($request->hasObjectParameter('playlist'))
            {
                $this->owner = $request->getObjectParameter('playlist')->getOwner();
            }
            elseif ($request->hasParameter('mychannel'))
            {
                $this->owner = $request->getObjectParameter('mychannel');
            }
            else if ($request->hasParameter('bookmarks'))
            {
                $this->owner = $request->getObjectParameter('bookmarks');
            }
            else if ($request->hasParameter('subscribedto'))
            {
                $this->owner = $request->getObjectParameter('subscribedto');
            }
            else if ($video && $request->getRouteName() != 'channel_home')
            {
                $this->owner = $video->getOwner();
            }
        }
        return $this->owner;
    }

    public function getDMPage()
    {
        if ($this->DMPage)
        {
            return $this->DMPage;
        }

        if ($this->isBrand())
        {
            if ($this->isExternal())
            {
                $page = 'extbrand';
            }
            else
            {
                $page = 'brand';
            }
        }
        else if ($this->isExternal())
        {
            $page = 'external';
        }
        else
        {
            $page = $this->getLocation();
        }

        $this->DMPage = $page;

        return $this->DMPage;
    }

    public function getDMSection()
    {
        if ($this->DMSection)
        {
            return $this->DMSection;
        }

        $section = '';

        if($this->isBrand())
        {
            $section .= 'brand';
        }
        else
        {
            if ($this->explicit)
            {
                $section .= 'explicit';
            }
            if ($this->getChannel())
            {
                $section .= ($section == '') ? '' : '/';
                $section .= $this->getChannel();
            }
        }

        $this->DMSection = $section;
        return $section;
    }

    public function getDMSite()
    {
        if ($this->DMSite)
        {
            return $this->DMSite;
        }

        if ($this->section != null)
        {
            $site = $this->section;
        }
        else
        {
            $site = DM_Config::getValue('MASSCAST_SECTION', 'dailymotion');

            $xgeoip = DM_XGeoIP::getInstance();
            $country = strtolower($xgeoip->getCountryCode());
            if (defined('SITE_TYPE') && SITE_TYPE == 'dev')
            {
                $country = 'fr';
            }

            if (!empty($country) && strpos('fr us be gb jp it ca ch de es ma pt br gr pl tr in au nl vn at id il ru my ie lu sg mx', $country) !== false)
            {
                $site .= '.' . $country;
            }

            // To see the country mapping, go to https://wiki.dailymotion.com/display/dev/Masscast+V2+Documentation#MasscastV2Documentation-Section
            else if (!empty($country) && strpos('ao bf bi bj bw cd cf cg ci cm cv er et ga gh gm gn gq gw ke lr ls mg ml mu mw mz na ne ng rw sc sl sn st sz td tg tz ug za zm zw', $country) !== false)
            {
                $site .= '.afr';
            }
            else if (!empty($country) && strpos('bd bn bt cn hk kh kp kr la lk mm mn mo mv np ph th tl tw', $country) !== false)
            {
                $site .= '.asia';
            }
            else if (!empty($country) && strpos('al ba bg by cz ee hr hu lt lv md me mk mt ro rs si sk ua', $country) !== false)
            {
                $site .= '.ee';
            }
            else if (!empty($country) && strpos('ad dk fi fo is je li mc no se va', $country) !== false)
            {
                $site .= '.we';
            }
            else if (!empty($country) && strpos('ag ar aw bb bo bs bz cl co cr cu do ec gd gt hn ht jm kn lc ni pa pe pr py sr sv tt uy vc ve', $country) !== false)
            {
                $site .= '.lat';
            }
            else if (!empty($country) && strpos('ae af am az bh cy dj dz eg eh ge iq ir jo kg km kw kz lb ly mr om pk ps qa sa sd so sy tj tm tn uz ye', $country) !== false)
            {
                $site .= '.me';
            }
            else if (!empty($country) && strpos('aq ck fj fm ki mh nr nu nz pg pw sb tk to tv vu ws', $country) !== false)
            {
                $site .= '.oce';
            }
            else
            {
                $site .= '.com';
            }
            $site = str_replace('.tr', '.tur', $site);
        }

        $this->DMSite = $site;
        return $site;
    }

    public function getVideo()
    {
        if ($this->video === null && $this->getRequest()->hasObjectParameter('video'))
        {
            $this->video = $this->getRequest()->getObjectParameter('video')->getSubstituteVideo();
        }
        return $this->video;
    }

    public function setVideo($video)
    {
        $this->video = $video;
        return $this;
    }

    public function isBrand()
    {
        $request = $this->getRequest();
        $owner   = $this->getOwner();
        $object  = false;

        if ($request->hasObjectParameter('group'))
        {
            $object = $request->getObjectParameter('group');
        }
        else if ($request->hasObjectParameter('hub'))
        {
            $object = $request->getObjectParameter('hub');
        }
        else if ($request->hasObjectParameter('video'))
        {
            $object = $request->getObjectParameter('video');
        }
        else if($this->getVideo())
        {
            $object = $this->getVideo();
        }

        return (($object && $object->hasCriteria('role', 'userbrand')) || ($owner && $owner->hasCriteria('role', 'userbrand')));
    }

    public function getReferer()
    {
        if (!$this->referer)
        {
            $this->referer = $this->getRequest()->getReferer();
        }
        return $this->referer;
    }

    public function setReferer($referer)
    {
        $this->referer = $referer;
        return $this;
    }

    public function setCallParameter($parameter, $value = '')
    {
        if(r()->getParameter($parameter))
        {
            $this->parameters[$parameter] = r()->getParameter($parameter);
        }
        else if($value !== '' && !is_null($value))
        {
            $this->parameters[$parameter] = $value;
        }

        return $this;
    }

    public function getCallParameter($parameter)
    {
        if(array_key_exists($parameter, $this->parameters))
        {
            $callParameter = $this->parameters[$parameter];
        }
        else
        {
            $callParameter = '';
        }
        return $callParameter;
    }

    public function getCallParameters()
    {
        if ($this->parameters)
        {
            return $this->parameters;
        }

        $this->parameters = array();
        $request = $this->getRequest();
        $video = null;

        // Owner infos
        $owner = $this->getOwner();
        if ($owner)
        {
            $this->setCallParameter('DMOWNER', $owner->getLogin());
            if ($owner->isChild() && $owner->getParent())
            {
                $this->setCallParameter('DMPARENT', $owner->getParent()->getLogin());
            }
        }

        /* DAILY-24711 to be reverted when campaign is finished BICHOI BASTA */
        if (strpos($request->getUserAgent(), 'Windows NT 6.1') !== 0)
        {
            $this->setCallParameter('WIN7', 1);
        }
        /* end DAILY-24711 to be reverted when campaign is finished BICHOI BASTA */

        $this->setCallParameter('z', Helper_Syndication::getId());
        $DMSyndication = Helper_Syndication::getId() !== '0' ? '1' : '0';

        $this->setCallParameter('DMSYNDICATION', $DMSyndication);

        // Browser
        $this->setCallParameter('DMLANGNAV', $request->getPreferredCulture());

        // Api player
        if (($request->getRouteName() == 'hub_home' && $request->hasObjectParameter('hub')) || Helper_Masscast::isPlaylistMode($request))
        {
            $this->setCallParameter('DMAPIPLAYER', 1);
        }
        else
        {
            $this->setCallParameter('DMAPIPLAYER', 0);
        }

        // Hubs - DAILY-16401
        if ($request->hasParameter('hub'))
        {
            $this->setCallParameter('DMHUB', DM_Hub::getInstance($request->getParameter('hub'))->getShortExtendedId());
        }

        $this->setCallParameter('DMROUTE', $this->getRequest()->getRouteName());
        $this->setCallParameter('_RM_HTML_DMROUTE_', $this->getRequest()->getRouteName());

        if ($request->isAuthenticated())
        {
            $this->setCallParameter('DMLOGGED', 1);
            $reader = $request->getReader();
            if ($reader->canShowGender())
            {
                $this->setCallParameter('DMGENDER', ($reader->isMale() ? 'M' : 'F'));
                $this->saveCookieParam('DMGENDER', $this->getCallParameter('DMGENDER'));
            }
            else
            {
                $this->removeCookieParam('DMGENDER');
            }

            if ($reader->canShowAge())
            {
                $this->setCallParameter('DMAGE', $reader->getAge());
                $this->saveCookieParam('DMAGE', $this->getCallParameter('DMAGE'));
            }
            else
            {
                $this->removeCookieParam('DMAGE');
            }

            $this->setCallParameter('DMREADER', str_replace('&', '_', $reader->getLogin()));
        }
        else
        {
            $this->setCallParameter('DMLOGGED', '0');
            if ($this->hasCookieParam('DMGENDER'))
            {
                $this->setCallParameter('DMGENDER', $this->getCookieParam('DMGENDER'));
            }
            else
            {
                $this->setCallParameter('DMGENDER');
            }

            if ($this->hasCookieParam('DMAGE'))
            {
                $this->setCallParameter('DMAGE', $this->getCookieParam('DMAGE'));
            }
            else
            {
                $this->setCallParameter('DMAGE');
            }

            // enable testing OAS campaign on user name even if the reader is not logged
            $this->setCallParameter('DMREADER');
        }

        if ($request->getCookie('yahoo_es') == 1 || $request->getParameter('partner') == 'yahoo_es' || preg_match('/^http:\/\/es\.([^.]*\.)?yahoo\.com.+$/', $this->getReferer()))
        {
            $this->setCallParameter('partner', 'yahoo_es');
        }
        else
        {
            $this->setCallParameter('partner');
        }

        if ($request->hasParameter('group'))
        {
            $this->setCallParameter('DMGROUP', $request->getParameter('group'));
        }

        // Video infos
        $video = $this->getVideo();
        if ($video || $request->isRequestedChannelHome())
        {
            if($video && $owner && $video->exists())
            {
                if ($request->isRequestedChannelHome())
                {
                    $this->setCallParameter('DMVSTAR', 1);
                }
                else
                {
                    // DAILY-14968 : No DMOWNER tag on channel homes
                    if (($revshare = $this->video->getExtendedData('revshare-claimer')))
                    {
                        try
                        {
                            $login = 'identified_' . DM_User::getInstance($revshare)->getLogin();
                        }
                        catch (Exception $e)
                        {
                            $login = 'identified_' . $revshare;
                        }
                    }
                    else
                    {
                        $login = $owner->getLogin();
                    }
                    $this->setCallParameter('DMOWNER', str_replace('&', '_', $login));
                }

                $tagStr = mb_substr(implode(',', $video->getPublicTags()), 0, 220, 'UTF-8');
                $this->setCallParameter('DMTITLE', str_replace(array('"', '\''), ' ', preg_replace('/[\t\r\n\v\f]/u', '', iconv('UTF-8','UTF-8//IGNORE', $video->getTitle()))));
                $this->setCallParameter('DMTAGS', iconv('UTF-8','UTF-8//IGNORE', $tagStr));

                // DAILY-27215
                $this->setCallParameter('DMVIDEOLANG', $video->getLanguage());

                $this->setCallParameter('DMEXT', ($this->isExternal() ? 1 : 0));
                $this->setCallParameter('DMVIDEO', $video->getId());

                if (($video->getOwner()->hasRole('advanced-statistics') || $video->getOwner()->hasRole('revshare') || $video->isPartner())
                    && !$video->hasCriteria('role', 'no-revshare'))
                {
                    $this->setCallParameter('DMREVSHARE', 1);
                }

                if($wbMediaKey = $video->getExtendedData('advertising-info'))
                {
                    $this->setCallParameter('WB_MEDIAKEY', $wbMediaKey);
                }

                if ($video->isPartner())
                {
                    $this->setCallParameter('DMPARTNER', 1);
                    $this->setCallParameter('DMVIDEOTYPE', 'official');
                }
                if ($video->isPartner())
                {
                    $this->setCallParameter('DMMONETISABLE', 1);
                    if ($video->isPartner())
                    {
                        $this->setCallParameter('DMVIDEOTYPE', 'official');
                    }
                }
                else
                {
                    $this->setCallParameter('DMVIDEOTYPE', 'ugc');
                }

                $this->setCallParameter('DMVIDEOAGE', floor((time() - $video->getDateCreated()->getTime()) / 3600));

                if ($video->isNoAdFit())
                {
                    $this->setIsNoAdFit(true);
                }
                if ($video->isExplicit())
                {
                    $this->setExplicit(true);
                }

                $this->setCallParameter('DMSTREAMMODE', $video->getStreamMode());

                // segment video views to be able to target some buckets
                $views = $video->getViewCount();
                if ($views < 500)
                {
                    $this->setCallParameter('DMVIEWS', '0+');
                }
                elseif ($views < 1000)
                {
                    $this->setCallParameter('DMVIEWS', '500+');
                }
                elseif ($views < 5000)
                {
                    $this->setCallParameter('DMVIEWS', '1k+');
                }
                elseif ($views < 10000)
                {
                    $this->setCallParameter('DMVIEWS', '5k+');
                }
                elseif ($views < 50000)
                {
                    $this->setCallParameter('DMVIEWS', '10k+');
                }
                elseif ($views < 100000)
                {
                    $this->setCallParameter('DMVIEWS', '50k+');
                }
                elseif ($views < 500000)
                {
                    $this->setCallParameter('DMVIEWS', '100k+');
                }
                else
                {
                    $this->setCallParameter('DMVIEWS', '500k+');
                }

                $this->setCallParameter('DMCAPPINGNONE', 1);
            }
        }

        // DAILY-32091
        if ($owner)
        {
            if ($owner->hasCriteria('role', 'contract'))
            {
                $this->setCallParameter('DMCONTRACT', 'contract');
            }
            elseif ($owner->hasCriteria('role', 'uploader-revshare'))
            {
                $this->setCallParameter('DMCONTRACT', 'uploader-revshare');
            }
            elseif ($owner->hasCriteria('role', 'revshare-bl'))
            {
                $this->setCallParameter('DMCONTRACT', 'revshare-bl');
            }
        }

        // for a list of pre-determined countries we can send the noadfit criteria to let the ad server decide knowing the video might not be
        // appropriate for ads
        $noadfitCountries = DM_Config::getValue('NOADFIT_COUNTRIES', array());

        if (in_array('all', $noadfitCountries) || in_array(strtolower(DM_XGeoIP::getInstance()->getCountryCode()), $noadfitCountries))
        {
            $this->setCallParameter('DMNOADFIT', (int) $this->isNoAdFit);
        }

        // Is Explicit
        $this->setCallParameter('DMEXPLICIT', (int) $this->getExplicit());

        $type = $this->getType();

        if (!empty($type))
        {
            $this->setCallParameter('DMVIDEOTYPE', $type);
        }

        // Channel infos
        $channel = $this->getChannel();
        if ($channel != '')
        {
            $this->setCallParameter('DMCHANNEL', $channel);
            $this->setCallParameter('_RM_HTML_DMCHANNEL_', $channel);
        }
        else if($this->getRequest()->getRouteName() == 'home')
        {
            $this->setCallParameter('DMCHANNEL', 'home');
            $this->setCallParameter('_RM_HTML_DMCHANNEL_', 'home');
        }

        if($request->getRouteName() == 'video_item')
        {
            $this->setCallParameter('DMDURATION', $video->getDuration());
            $this->setCallParameter('_RM_HTML_DMDURATION_', $video->getDuration());
        }
        else
        {
            $this->setCallParameter('DMDURATION', 0);
            $this->setCallParameter('_RM_HTML_DMDURATION_', 0);
        }

        if ($request->getReqLogin())
        {
            if($owner && $owner->isPartner())
            {
                $this->setCallParameter('DMPARTNER', 1);
            }
        }

        // Userbrand criteria
        if($this->isBrand())
        {
            $this->setCallParameter('DMUSERBRAND', 1);
        }

        // Lang info
        $lang = DM_LocaleV2::getLanguage();
        if ($lang)
        {
            $this->setCallParameter('DMLANG', $lang);
        }

        // Type info
        $this->setCallParameter('DMTYPE', DM::getRunningEnvironment());

        // !! todo reimplement skinning
        // if ($this->getPage()->getSkin())
        // {
        //     $this->parameters['DMSKIN'] = $this->getPage()->getSkin()->getName();
        // }

        // Search infos
        if ($request->hasReqSearch() && $request->getReqSearch() != '')
        {
            $this->setCallParameter('DMSEARCH', trim(urlencode($request->getReqSearch())));
        }

        // Related infos: DAILY-38059
        if ($request->hasObjectParameter('related'))
        {
            $relatedVideo = DM_Video::getInstance($request->getParameter('related'));
            if ($relatedVideo && $relatedVideo->getOwner()->hasCriteria('role', 'userbrand'))
            {
                $this->setCallParameter('DMRELATEDOWNER', $relatedVideo->getOwner()->getLogin());
            }
        }

        // Playlist infos
        if ($request->hasObjectParameter('playlist'))
        {
            $playlist = $request->getObjectParameter('playlist');
            $playlist_id = $playlist->getExtendedId();
            $playlist_id = substr($playlist_id, 0, strpos($playlist_id, '_'));

            $this->setCallParameter('DMPLAYLIST', $playlist_id);
            $this->setCallParameter('DMPLAYLISTOWNER', str_replace('&', '_', $playlist->getOwner()->getLogin()));
        }

        // 404
        if ($request->getCookie('referer') == '404')
        {
            $this->setCallParameter('DMREFERER', 404);
        }

        //External
        if ($this->isExternal())
        {
            $urlData = parse_url($this->getReferer());

            $this->setCallParameter('DMREFEREREXT', isset($urlData['host'])
                ? trim(urlencode(urldecode($urlData['host'])))
                : ''
            );

            $this->setCallParameter('DMREFEREREXTPATH', isset($urlData['path'])
                ? $urlData['path']
                : ''
            );
        }

        // V3
        $this->setCallParameter('DMV3', 1);

        // CRITEO - DAILY-22068, DAILY-22151, DAILY-23806
        if (DM_Criteo::isEnabled())
        {
            // Get cookie value (eg: "/criteofrhp=1/criteofrlp=1")
            $crtgContent = DM_Criteo::getCrtgContent();

            // Format cookie value and pass it to masscast
            if ($crtgContent)
            {
                $crtgContent = explode('/', $crtgContent);
                foreach ($crtgContent as $crtgKey => $crtgValue)
                {
                    if ($crtgValue)
                    {
                        $crtgValue = urldecode($crtgValue);
                        $crtgValue = explode('=', $crtgValue);
                        if (count($crtgValue) == 2)
                        {
                            $this->setCallParameter($crtgValue[0], $crtgValue[1]);
                        }
                    }
                }
            }
        }

        // DMHANDSET : user's device type (DAILY-26125)
        $this->setCallParameter('DMHANDSET', $request->getDeviceType());

        $this->setCallParameter('DMCAPPINGNONE', 1);

        return $this->parameters;
    }

    public function getCallAds1()
    {
        if(isset($this->callAds1))
        {
            return $this->callAds1;
        }
        $this->callAds1 = $this->getCall(false, 'dailymotion.web/ads1');
        return $this->callAds1;
    }

    /*public function getCallAds2()
    {
        if(isset($this->callAds2))
        {
            return $this->callAds2;
        }
        $this->callAds2 = $this->getCall(false, 'dailymotion.web/ads2');
        return $this->callAds2;
    }*/

    // this function is automaticaly called when inserting the main masscast widget to your page
    // you should call it yourself only if you want to get the call string and pass it to the player
    public function getCall($instream = false, $subPage = '')
    {
        if (isset($this->call) && $subPage === '')
        {
            return $this->call;
        }

        $request = $this->getRequest();

        // See DAILY-11956
        if ($request->getParameter('abnqf'))
        {
            $this->call = '';
            return $this->call;
        }

        // COMPUTE PARAMS FOR QUERY SRTING
        $dynamicParams = [];
        $parameters = $this->getCallParameters();
        if($request->getRouteName() == 'video_item')
        {
            $dynamicParams = DM_Ads_Helper::displayAdsParamsForVideo($this->getVideo());
        }
        else
        {

            $dynamicParams = DM_Ads_Helper::displayAdsParamsForVideoList();
        }

        $parameters = array_merge($parameters, $dynamicParams);
        $params = '';
        foreach($parameters as $key => $value)
        {
            $params .= '&'.$key.'='.$value;
        }
        $params = trim($params, '&');

        $masscastBaseUrl = '/masscast';
        $outputType = 2;

        $this->call = $masscastBaseUrl . '/' . $outputType;

        // ADD POSITIONS
        $positions = '';

        foreach ($this->getElement() as $element)
        {
            if ($this->isOverloadElement($element) == false)
            {
                $positions .= $element . ',';
            }
        }
        $positions = trim($positions, ',');

        if(isset($subPage) && $subPage !== '')
        {
            $this->call .= '/' . $subPage;
        }
        else
        {
            // SITE
            if ($site = $this->getDMSite())
            {
                $this->call .= '/' . $site;
            }

            // SECTION
            if ($section = $this->getDMSection())
            {
                $this->call .= '/' . $section;
            }

            // PAGE
            if ($page = $this->getDMPage())
            {
                $this->call .= '/' . $page;
            }
        }

        $this->call .= sprintf('/__RAND__@%s', $positions);

        if ($params)
        {
            $this->call .= '?' . $params;
        }

        if (!$this->doAdCall)
        {
            $this->call = '';
        }

        $newCookieValue = json_encode($this->cookieData);

        if (r()->getCookie('mc') != $newCookieValue)
        {
            r()->getResponse()->setCookie('mc', urlencode($newCookieValue));
        }

        $this->call = 'http://mc.dailymotion.com' . $this->call;

        return $this->call;
    }

    public function getYahooForVideoParams()
    {
        $params = array();

        $yh_gender = 0;
        $yh_age = 0;
        if (r()->isAuthenticated())
        {
            $reader = r()->getReader();

            // Gender
            if ($reader->canShowGender())
            {
                $yh_gender = ($reader->isMale() ? 1 : 2);
            }

            // Age
            if ($reader->canShowAge())
            {
                $age = $reader->getAge();
                if ($age >= 13 && $age <= 17)
                {
                    $yh_age = 'a';
                }
                else if ($age >= 18 && $age <= 20)
                {
                    $yh_age = 'b';
                }
                else if ($age >= 21 && $age <= 24)
                {
                    $yh_age = 'c';
                }
                else if ($age >= 25 && $age <= 29)
                {
                    $yh_age = 'd';
                }
                else if ($age >= 30 && $age <= 34)
                {
                    $yh_age = 'e';
                }
                else if ($age >= 35 && $age <= 44)
                {
                    $yh_age = 'f';
                }
                else if ($age >= 45 && $age <= 49)
                {
                    $yh_age = 'g';
                }
                else if ($age >= 50 && $age <= 54)
                {
                    $yh_age = 'h';
                }
                else if ($age >= 55 && $age <= 64)
                {
                    $yh_age = 'i';
                }
                else if ($age >= 65)
                {
                    $yh_age = 'j';
                }
            }
        }
        $params['yh_pd_x'] = $yh_gender . $yh_age;

        return $params;
    }

    public function addJSON($json, $key=null)
    {
        $this->js['json'][] = $json;
        parent::addJSON($json, $key);
    }

    public function addEnv($key, $value, $forceAjaxBehaviour = false)
    {
        $this->js['env_top'][] = $key . ' = ' . self::valueToJS($value) . ';';
        parent::addEnv($key, $value);
    }

    public function addEnvTop($key, $value)
    {
        if (is_array($value))
        {
            $this->js['env_top'][] = $key;
        }
        else if(empty($value))
        {
            $this->js['env_top'][] = $key . ' = "None";';
        }
        else
        {
            $this->js['env_top'][] = $key . ' = ' . self::valueToJS($value) . ';';
        }
        parent::addEnvTop($key, $value);
    }


    private static function valueToJS($value)
    {
        if (is_bool($value))
        {
            return $value ? 'true' : 'false';
        }
        return is_numeric($value) ? $value : '"' . $value . '"';
    }

    public function getJs()
    {
        return $this->js;
    }

    public function getAsyncJS()
    {
        return array
        (
            'call' => $this->getCall(),
            // should be passed by the template
            // 'enableRotateAd' => DM_Config::getValue('ENABLE_ROTATE_AD') ? true : false),
        );
    }

    /******************************
    *
    *   CONFIGURE
    *
    ******************************/

    public function configure()
    {
        $this->getCall();

        if (!$this->doAdCall) return;

        parent::configure();
    }

    public function afterConfigure()
    {
        if (!$this->doAdCall) return;

        $this->addEnvTop('masscast_async_call', $this->getCall());
        $this->addEnvTop('masscast_async_ads1_call', $this->getCallAds1());
    }

    // If widget was inserted in the page
    public function buildHtml()
    {
        if (!$this->doAdCall) return;

        if ($this->isClone)
        {
            $this->setData('<div id="mc_' . $this->getPosition() . '" class="mc mc_hide"></div>');
        }
    }
}
class DM_WidgetV3_PageItem_Masscast__Exception extends DM__Exception {}

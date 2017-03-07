<?php
class Page_MiraController extends Page_SiteController
{
    protected $locale;

    // Redirect routes that are supported in Mira under a different form
    public function redirectNonCanonicalRoutes() {
        // redirect /user/<user>/1 to /<user>
        if (
            $this->r->getRouteName() === 'video_list' &&
            $this->r->hasParameter('user')
        ) {
            $this->r->redirect('/' . $this->r->getParameter('user'));
        }
    }

    protected function configure()
    {
        parent::configure();

        $this->redirectNonCanonicalRoutes();

        $serviceContainer = DM_ServiceContainer::getInstance();
        $this->API = $serviceContainer['dm-api'];

        $this->setApiEndpoint();

        $defaultLanguage = DM_LocaleV2::getLanguage();
        $userLanguage = $this->r->getCookie('webapplang');
        $miraUILocale = $this->r->getCookie('mira_ui_locale');
        $miraLanguage = $defaultLanguage;

        if (isset($userLanguage))
        {
            $miraLanguage = $userLanguage;
        }

        $localeToSiteCode = [
            'de_DE' => 'de',
            'ar_AA' => 'aa-ar',
            'es_AR' => 'ar',
            'en_AU' => 'au',
            'de_AT' => 'at',
            'nl_BE' => 'be-nl',
            'fr_BE' => 'be-fr',
            'pt_BR' => 'br',
            'fr_CA' => 'ca-fr',
            'en_CA' => 'ca-en',
            'zh_CN' => 'cn',
            'ko_KR' => 'kr',
            'es_ES' => 'es',
            'en_US' => 'us',
            'fr_FR' => 'fr',
            'el_GR' => 'gr',
            'en_IN' => 'in',
            'id_ID' => 'id',
            'en_EN' => 'en',
            'en_IE' => 'ie',
            'it_IT' => 'it',
            'ja_JP' => 'jp',
            'ms_MY' => 'my',
            'fr_MA' => 'ma',
            'es_MX' => 'mx',
            'en_PK' => 'pk',
            'nl_NL' => 'nl',
            'en_PH' => 'ph',
            'pl_PL' => 'pl',
            'pt_PT' => 'pt',
            'ro_RO' => 'ro',
            'ru_RU' => 'ru',
            'en_SG' => 'sg',
            'it_CH' => 'ch-it',
            'de_CH' => 'ch-de',
            'fr_CH' => 'ch-fr',
            'zh_TW' => 'tw',
            'th_TH' => 'th',
            'fr_TN' => 'tn',
            'tr_TR' => 'tr',
            'en_GB' => 'gb',
            'vi_VN' => 'vn',
            'fr_CI' => 'ci',
            'fr_SN' => 'sn',
            'en_ZA' => 'za',
            'en_NG' => 'ng',
            'ar_SA' => 'sa',
            'ar_AE' => 'ae',
            'ar_EG' => 'eg',
        ];

        $localeToTxCode = [
            "ar_AA" => "ar",
            "es_AR" => "es",
            "en_AU" => "en_GB",
            "de_AT" => "de",
            "nl_BE" => "nl",
            "fr_BE" => "fr",
            "pt_BR" => "pt_BR",
            "fr_CA" => "fr",
            "en_CA" => "en_US",
            "zh_CN" => "zh",
            "fr_FR" => "fr",
            "de_DE" => "de",
            "el_GR" => "el",
            "en_IN" => "en_US",
            "id_ID" => "id",
            "en_EN" => "en_US",
            "en_IE" => "en_GB",
            "it_IT" => "it",
            "ja_JP" => "ja",
            "ms_MY" => "ms",
            "es_MX" => "es",
            "fr_MA" => "fr",
            "nl_NL" => "nl",
            "en_PK" => "en_US",
            "en_PH" => "en_US",
            "pl_PL" => "pl",
            "pt_PT" => "pt_BR",
            "ro_RO" => "ro",
            "ru_RU" => "ru",
            "en_SG" => "en_US",
            "ko_KR" => "ko",
            "es_ES" => "es",
            "it_CH" => "it",
            "de_CH" => "de",
            "fr_CH" => "fr",
            "zh_TW" => "zh_TW",
            "th_TH" => "th",
            "fr_TN" => "fr",
            "tr_TR" => "tr",
            "en_GB" => "en_GB",
            "en_US" => "en_US",
            "vi_VN" => "vi",
            "fr_CI" => "fr",
            "fr_SN" => "fr",
            "en_ZA" => "en_GB",
            "en_NG" => "en_GB",
            "ar_SA" => "ar",
            "ar_AE" => "ar",
            "ar_EG" => "ar",
        ];

        $rtlTxLocales = [
            "ar",
        ];

        if ($this->r->getRouteName() === 'mira_login_redirect') {
            $this->useTemplate('mira/login_redirect.html');
        }
        else {
            $this->useTemplate('mira/index.html');
        }
        $this->data['mira_lang'] = json_encode($miraLanguage);
        $this->data['user_lang'] = json_encode($userLanguage);
        $locale = $this->getLocale();
        $this->data['locale'] = json_encode($locale);

        // CORRECT LOCALE DATA TO USE:
        $miraContentLocale = '';
        $miraSiteCode = '';
        // if the preferred user locale is unknown (not set in cookie mira_ui_locale nor webapplang)
        // we choose the geo detected locale
        if (!$miraUILocale) { // cookie "mira_ui_locale"
            if ($userLanguage) { // cookie "webapplang"
                // try to find an approximate locale given a lang
                // This is not perfect because "fr" can be "fr_FR", "fr_CA", "fr_BE", but we
                // cannot do better in this situation since the site_code info is stored by the webapp
                // in the localstorage (in dm.settings-settings['localization']).
                // That's why we try to use the geo detected language ($defaultLanguage) if it
                // is the same as $userLanguage...
                if ($defaultLanguage === $userLanguage) {
                    $miraUILocale = $locale['locale'];
                }
                // ...If not, we fallback to the approximation.
                else {
                    $miraUILocale = $txCodeToLocaleMapping[$miraLangToTxCode[$userLanguage]];
                }
                $miraContentLocale = $miraUILocale;
                $miraSiteCode = $localeToSiteCode[$miraContentLocale];
            }
            else {
                $miraUILocale = 'auto';
                $miraContentLocale = $locale['locale'];
                $miraSiteCode = $locale['site_code'];
            }
        }
        else {
            // Right now in DM there is no distinction between UI and content locale
            $miraContentLocale = $miraUILocale;
            if (array_key_exists($miraUILocale, $localeToSiteCode))
            {
                $miraSiteCode = $localeToSiteCode[$miraUILocale];
            }
            else
            {
                $miraSiteCode = 'us';
            }
        }
        if ($miraUILocale === 'auto') {
            if (array_key_exists($miraContentLocale, $localeToTxCode))
            {
                $txCode = $localeToTxCode[$miraContentLocale];
            }
            else
            {
                $txCode = 'en_US';
            }
        }
        else {
            if (array_key_exists($miraUILocale, $localeToTxCode))
            {
                $txCode = $localeToTxCode[$miraUILocale];
            }
            else
            {
                $txCode = 'en_US';
            }
        }
        // useless comment to force update in release dashboard
        $this->data['tx_code'] = $txCode;
        $this->data['mira_ui_locale'] = json_encode($miraUILocale);
        $this->data['mira_content_locale'] = json_encode($miraContentLocale);
        $this->data['mira_site_code'] = json_encode($miraSiteCode);
        $this->data['dir'] = in_array($txCode, $rtlTxLocales) ? 'rtl' : 'ltr';

        $this->data['apiEndpoint'] = json_encode($this->getApiEndpoint());
        $this->data['siteEndpoint'] = json_encode($this->getSiteEndpoint());
        $this->data['gatekeeper'] = json_encode($this->getGatekeeperValues());
        $this->data['pxl_sdk_url'] = $this->getPixelleSDKUrl();

        // PlayerV5
        $this->data['pv5_config'] = json_encode($this->getPlayerV5Config());

        Helper_Cookie::handleFromCampaignCookie($this->r);
        Helper_Cookie::handleFromSearchEngineCookie($this->r);
    }

    protected function getLocale()
    {
        if (!isset($this->locale))
        {
            $this->locale = $this->API->get('/locale')['result'];
            $this->locale['country_code'] = DM_XGeoIP::getInstance()->getCountryCode();
        }
        return $this->locale;
    }

    protected function setApiEndpoint()
    {
        $environment = DM::getRunningEnvironment();
        if ($environment == "prod")
        {
            DM_Config::setValue("MIRA_DM_API_ENDPOINT", "https://api.dailymotion.com");
        }
        elseif ($environment == "preprod")
        {
            DM_Config::setValue("MIRA_DM_API_ENDPOINT", "//api.adm.preprod.dailymotion.com");
        }
        elseif ($environment == "stage")
        {
            DM_Config::setValue("MIRA_DM_API_ENDPOINT", "//api.adm.stage-01.dailymotion.com");
        }
        else
        {
            DM_Config::setValue("MIRA_DM_API_ENDPOINT", "//api.adm.dailymotion.com");
        }
        return null;
    }

    protected function getApiEndpoint()
    {
        return DM_Config::getValue("MIRA_DM_API_ENDPOINT");
    }

    protected function getSiteEndpoint()
    {
        $siteUrl = DM_Config::getValue("EMAIL_URL_BASE");
        if (DM_Config::getValue("MIRA_DM_API_ENDPOINT"))
        {
            $siteUrl = preg_replace('#^https?://api\.(.*)/$#', 'http://$1', DM_Config::getValue("MIRA_DM_API_ENDPOINT"));
        }
        return $siteUrl;
    }

    protected function getGatekeeperValues()
    {
        return array
        (
            'ads' => DM_GateKeeper::match('MIRA_V4_DISPLAY_ADS', r()),
            'MIRA_YIELDMO' => DM_GateKeeper::match('MIRA_YIELDMO', r()),
            'MIRA_YIELDMO_INLIST' => DM_GateKeeper::match('MIRA_YIELDMO_INLIST', r()),
            'MIRA_MOPUB' => DM_GateKeeper::match('MIRA_MOPUB', r()),
            'MIRA_REPOST_CREATION' => DM_GateKeeper::match('MIRA_REPOST_CREATION', r()),
            'OPTIMIZELY' => DM_GateKeeper::match('OPTIMIZELY', r()),
            'MIRA_DISABLE_DISPLAY' => DM_GateKeeper::match('MIRA_DISABLE_DISPLAY', r()),
            'MAIN_HEADER_BAR_BLACK' => DM_GateKeeper::match('MAIN_HEADER_BAR_BLACK', r())
        );
    }

    protected function getPixelleSDKUrl()
    {
        return DM::getRunningEnvironment() == 'prod' ? '//api.dmcdn.net/pxl/client.js' : '//api-stage.dmcdn.net/pxl/client.js';
    }

    protected function getPlayerV5Config()
    {
        $settings = [
            'logger' => DM::getRunningEnvironment() == 'prod' ? false : 'player,video,videoslot',
            'autoplay' => true,
            'logo' => false,
            'clientType' => 'mira'
        ];

        if ($this->r->hasObjectParameter('video'))
        {
            $video = $this->r->getObjectParameter('video');
            $videoId = Helper_PlayerV5::getVideoId($video);
            return Helper_PlayerV5::getConfig($videoId, $settings);
        }
        return Helper_PlayerV5::getConfig(null, $settings);
    }
}

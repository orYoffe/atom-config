<?php
class Shared_Footer_LocaleSelectorController extends Page_SiteController
{
    // array of available local on locale selector
    protected $locales   = array();
    protected $languages = array();
    protected $data = array();

    // boolean to enable label on available locales
    protected $hasAvailableLocalesLabel = false;

    // set AvailableLocales div with display none
    protected $hideAvailableLocales = false;

    /**
     * Enable label in availableLocales Div
     */
    public function withAvailableLocalesLabel()
    {
        $this->hasAvailableLocalesLabel = true;
    }

    /**
     * Test if label in availableLocales Div is enable
     */
    public function hasAvailableLocalesLabel()
    {
        return $this->hasAvailableLocalesLabel;
    }

    /**
     * Enable display none on availableLocales Div
     */
    public function withAvailableLocalesHidden()
    {
        $this->hideAvailableLocales = true;
        return $this;
    }

    /**
     * Test if display none is enable on availableLocales Div
     */
    public function hasAvailableLocalesHidden()
    {
        return $this->hideAvailableLocales;
    }

    /**
     * Get $this->locales value
     *
     * @return array $this->locales value
     */
    protected function getLocales()
    {
        return $this->locales;
    }

    protected function configure()
    {
        $request = r();
        $this->useTemplate('shared/footer/_localeselector.html');

        $localizableRoutes = array
        (
            'home', 'channel_home', 'channel_list',
            'faq', 'feedback', 'about', 'tools',
            'extras', 'jukebox_factory', 'official', 'legal',
            'browse', 'admin_newsletter', 'topic_item'
        );

        $countries = DM_Country::getI18nAvailableCountries();

        $isAjax = DM_Request::isAjax();
        $baseRequest = $isAjax && $request->getParameter('from_request') ? r($request->getParameter('from_request')) : $request;
        $filter = $request->getReqFirstFilter();
        $requestIsLocalizable = false;

        // When the localeselector's html is in the page,
        // the js initialize method call initCountrySelectorOnLoad.
        // If the localeselector is ajax loaded, we need to call initCountrySelectorOnLoad now.
        if ($isAjax)
        {
            $this->addJSON('DM_LocaleSelector.initCountrySelectorOnLoad();');
        }
        // Define if the current request is localizable or not
        if (
            (
                (
                    $baseRequest->isReqMode('collection') &&
                    in_array($baseRequest->getReqContentType(), array('user', 'tag', 'video', 'channel', 'group')) &&
                    !$baseRequest->getReqLogin()
                ) ||
                in_array($baseRequest->getRouteName(), $localizableRoutes)
            )
        )
        {
            $requestIsLocalizable = true;
        }

        if ($request->isAuthenticated() && $request->getReader()->getAge() && $request->getReader()->getAge() < 13)
        {
            unset($countries['us']);
        }

        $this->data['countries'] = [];

        // Loop on all possible country / locale
        foreach ($countries as $countryCode => $flag)
        {
            $countryName = DM_Country::getInstanceFromCode($countryCode)->getName();
            foreach ($flag as $locale => $countryLocaleName)
            {
                // build flag uri
                $req = $baseRequest->dup();
                $language = strtolower(substr($locale, 0, 2));

                if ($requestIsLocalizable)
                {
                    if ($req->hasReqCriteria('language'))
                    {
                        $req->setReqCriteria('language', $language);
                    }
                    else
                    {
                        $req->setReqLocalization(DM_LocaleV2::$cookieValuesToSiteVersion[$locale]);
                    }
                }

                if (count($flag) > 1)
                {
                    $countryLocaleName .= ' (' . strtoupper(substr($locale, 0, 2)) . ')&#x200E;'; // &#x200E; for good display of the parenthesis in arabic
                }

                $this->data['countries'][$countryCode]['country_name'] = $countryLocaleName;

                $this->data['countries'][$countryCode]['locales'][] = array
                (
                    'language_label' => DM_Language::getPlayerSubtitleLabel($language),
                    'language'     => $language,
                    'href'         => preg_replace('/#|\?.*$/', '', $req->buildUri())
                );
            }
        }
        echo var_dump($this->data['countries']);die();
    }
}

<?php

class Helper_Settings
{
    static public function getWidgetTitle($widget)
    {
        $title = null;

        try
        {
            $title = $widget->getTitle();
        }
        catch(Exception $e) { }

        return $title;
    }

    static public function getDeveloperNewWidget($request)
    {
        $pis = [];

        if (
            (
                !r('@apikey_list')->setObjectParameter('client', $request->getReader())->getIterator()->getTotal()
            )
            && !$request->getCookie("dmapin")
        )
        {
            var_dump(DM_Config::getValue('DEVELOPER_AREA.URL'));die();
            $pi = DM_WidgetV3::getComponentInstance('Box');
            $pi->newPageItem('Notice')
                ->setType('info')
                ->setCloseCookieKey('dmapin')
                ->setTitle(__('Create apps using the Dailymotion platform'))
                ->setMessage(
                    __('Dailymotion has an open API, allowing developers to integrate our suite of videos features anywhere on the web, in applications, or on devices.') .
                    '' .
                    __('Getting started:') . '<div class="pdg-start-lg pdg-top-md"><ol><li>' . formatString(__('Read our |api_documentation| and get Dailymotion team and community support.'), array('api_documentation' => '<b><a href="' . DM_Config::getValue('DEVELOPER_AREA.URL') . '" target="_blank">' . __('API documentation') . '</a></b>'), '|') . '</li>
                    <li>' . __('Ready to code? Register your app and get an API key.') . '</li></ol></div>'
                );
            $pis[] = $pi;
        }

        $pis[] = Helper_WidgetV3::getPI('User_Settings_Developer_CreateAPIKey')
            ->setCol(6)
            ->setLast();

        return $pis;
    }

    static public function getDeveloperWidget($request)
    {
        $pis = [];

        if (!$request->getCookie("dmapih"))
        {
            $pi = DM_WidgetV3::getComponentInstance('Box');
            $pi->newPageItem('Notice')
                ->setType('info')
                ->setCloseCookieKey('dmapih')
                ->setTitle(__('Need help?'))
                ->setMessage(formatString
                    (
                        __('Explore our |api_documentation| to find answers to your questions and get support from our community.'),
                        array('api_documentation' => '<b><a href="' . DM_Config::getValue('DEVELOPER_AREA.URL') . '" target="_blank">' . __('API documentation') . '</a></b>'),
                        '|'
                    )
                );
            $pis[] = $pi;
        }

        $pis[] = Helper_WidgetV3::getPI('User_Settings_Developer');

        return $pis;
    }

    static public function getStaticConnectionUrl($url)
    {
        return DM::applyHttps(DM::getStaticUrlFromPath(($url) ? $url : '/images/icon_social_app.png'));
    }

    /**
     * Get the end user menu part of the overview page
     * @return [Array]
     */
    static public function getEndUserOverview()
    {
        return [
            [
                'label'       => __('Channel Settings'),
                'description' => __("Manage your channel's name, activity preferences, and other basic settings."),
                'link'        => r('settings')->setParameter('action', 'channel'),
                'button'      => 'edit',
                'partner'     => false
            ],
            [
                'label'       => __('Notifications'),
                'description' => __('Manage your email alert and newsletter preferences.'),
                'link'        => r('settings')->setParameter('action', 'notifications'),
                'button'      => 'edit',
                'partner'     => false
            ],
            [
                'label'       => __('Account Settings'),
                'description' => __('Manage your email, password, and social sign-in settings.'),
                'link'        => r('settings')->setParameter('action', 'account'),
                'button'      => 'edit',
                'partner'     => false
            ]
        ];
    }

    /**
     * Get the end user menu of the overview page
     * @return [Array]
     */
    static public function getPartnerOverview()
    {
        $user = r()->getReader();
        return [
            [
                'label'           => __('Video Monetization'),
                'description'     => __('Earn revenue from views of ads served on your videos.'),
                'link'            => r('settings')->setParameter('action', 'videomonetization'),
                'partnerFeature'  => true,
                'featureDisabled' => !$user->hasCriteria('role','uploader-revshare'),
                'notice'          => __('Verify your websites to earn extra revenue when you embed your videos on them.'),
                'noticeCondition' => 'show-sites-warning',
                'tutorial'        => [
                    [
                        'title'       => __('What is it?'),
                        'explanation' => __('On Dailymotion, most videos are served with in-stream advertisements—ads that appear before, during, or after videos. Website monetization gives everyone the opportunity to share in the revenue these advertisements generate. Simply embed Dailymotion videos or the Dailymotion Widget on one of your sites, and earn revenue every time someone views an ad served on these videos.')
                    ],
                    [
                        'title'       => __('How much can I make?'),
                        'explanation' => __('With video monetization, you can earn a large share of all revenue generated by ads served on your videos. And, you can make even more by using website monetization to embed your videos on your own websites.')
                    ],
                    [
                        'title'       => __('How do I get paid?'),
                        'explanation' => __("Once you've filled out your banking information, earned revenue will automatically be transferred to your PayPal account or bank account every month when your balance exceeds $100.")
                    ]
                ]
            ],
            [
                'label'           => __('Paid Content'),
                'description'     => __('Rent your videos on demand or on a monthly subscription basis to earn revenue.'),
                'link'            => r('settings')->setParameter('action', 'paidcontent'),
                'partnerFeature'  => true,
                'featureDisabled' => !$user->hasCriteria('role','paywall-enabled'),
                'tutorial'        => [
                    [
                        'title'       => __('What is it?'),
                        'explanation' => __('Paid content allows you to earn revenue two ways.')
                                        .' <ol><li>1. ' . __('Rent your videos to users on an individual basis for 48 hours at a time.') . '</li>'
                                        . '<li>2. ' . __('Sell a monthly subscription that gives paying users access to view all of your channel\'s videos.') . '</li></ol>'
                                        . __('Either way, the pricing for these options is completely up to you. Keep in mind that in-stream ads are disabled on all paid videos.')
                    ],
                    [
                        'title'       => __('How much can I make?'),
                        'explanation' => __('With paid content, you\'ll earn a 70% share of all revenue generated by customers who rent your videos or pay to subscribe to your channel.')
                    ],
                    [
                        'title'       => __('How do I get paid?'),
                        'explanation' => __("Once you've filled out your banking information, earned revenue will automatically be transferred to your PayPal account or bank account every month when your balance exceeds $100.")
                    ]
                ]
            ],
            [
                'label'           => __('Website Monetization'),
                'description'     => __('Embed Dailymotion videos on your websites and earn a share of advertising revenue.'),
                'link'            => r('settings')->setParameter('action', 'websitemonetization'),
                'warning'         => __('You must verify your sites before you can earn revenue from embedding individual videos on them.'),
                'warningCondition'=> 'show-banking-warning',
                'featureDisabled' => !$user->hasCriteria('role','website-monetization'),
                'partnerFeature'  => true,
                'tutorial'        => [
                    [
                        'title'       => __('What is it?'),
                        'explanation' => __('On Dailymotion, most videos are served with in-stream advertisements—ads that appear before, during, or after videos. Website monetization gives everyone the opportunity to share in the revenue these advertisements generate. Simply embed Dailymotion videos or the Dailymotion Widget on one of your sites, and earn revenue every time someone views an ad served on these videos.')
                    ],
                    [
                        'title'       => __('How much can I make?'),
                        'explanation' => __('With website monetization, you can earn a share of all revenue generated by ads served on videos that you have embedded. If you embed your own videos, you\'ll earn even more.')
                    ],
                    [
                        'title'       => __('How do I get paid?'),
                        'explanation' => __("Once you've filled out your banking information, earned revenue will automatically be transferred to your PayPal account or bank account every month when your balance exceeds $100.")
                    ]
                ]
            ],
            [
                'label'          => __('Logo Overlay'),
                'description'    => __('Add a logo to the bottom right corner of your videos.'),
                'link'           => r('settings')->setParameter('action', 'logooverlay'),
                'button'         => ($user->hasPlayerWatermark()) ? 'edit' : 'start',
                'partnerFeature' => true
            ],
            [
                'label'           => __('Player Customization'),
                'description'     => __('Customize the Dailymotion video player to create a branded experience when your videos are embedded on external websites.'),
                'link'            => r('settings')->setParameter('action', 'playercustomization'),
                'button'          => (Helper_User::hasExternalPlayerCustomization($user)) ? 'edit' : 'start',
                'partnerFeature'  => true
            ]
        ];
    }

    /**
     * CHANNEL SETTINGS SIDEBAR MENU
     * @param  [String] $action           [Name of the page]
     * @param  [Boolean] $user_is_partner [Allow features whether the user is partner ot not]
     * @return [Array]
     */
    static public function getChannelSettingsMenu($action, $user_is_partner, $username)
    {
        $menuData = [];
        $user = r()->getReader();
        $settingsRequest = r('@settings');

        // OVERVIEW
        $menuData['overview'] =
        [
            'links' =>
            [
                [
                    'label'    => __('Overview'),
                    'href'     => $settingsRequest->buildURI(),
                    'selected' => $action === 'overview'
                ]
            ]
        ];

        // CHANNEL SETTINGS
        $menuData['channel'] =
        [
            'title' => __('Channel'),
            'links' =>
            [
                [
                    'label'    => __('Channel Settings'),
                    'href'     => $settingsRequest->setParameter('action', 'channel')->buildURI(),
                    'selected' => $action === 'channel',
                ],
                [
                    'label'    => __('Notifications'),
                    'href'     => $settingsRequest->setParameter('action', 'notifications')->buildURI(),
                    'selected' => $action === 'notifications',
                ],
                [
                    'label'    => __('Video Branding'),
                    'href'     => $settingsRequest->setParameter('action', 'logooverlay')->buildURI(),
                    'selected' => $action === 'logooverlay',
                    'hidden'   => !$user_is_partner
                ],
                [
                    'label'    => __('Player Customization'),
                    'href'     => $settingsRequest->setParameter('action', 'playercustomization')->buildURI(),
                    'selected' => $action === 'playercustomization',
                    'hidden'   => !$user_is_partner
                ],
                [
                    'label'    => __('Monetization'),
                    'href'     => $settingsRequest->setParameter('action', 'monetization')->buildURI(),
                    'selected' => $action === 'monetization',
                    'hidden'   => $user_is_partner
                ]
            ]
        ];

        // MONETIZATION
        if($user_is_partner)
        {
            $menuData['monetization'] =
            [
                'title' => __('Monetization'),
                'links' =>
                [
                    [
                        'label'    => __('Video Monetization'),
                        'href'     => $settingsRequest->setParameter('action', 'videomonetization')->buildURI(),
                        'selected' => $action == 'videomonetization',
                        'hidden'   => !$user_is_partner
                    ],
                    [
                        'label'    => __('Paid Content'),
                        'href'     => $settingsRequest->setParameter('action', 'paidcontent')->buildURI(),
                        'selected' => $action == 'paidcontent',
                        'hidden'   => !$user_is_partner
                    ],
                    [
                        'label'    => __('Website Monetization'),
                        'href'     => $settingsRequest->setParameter('action', 'websitemonetization')->buildURI(),
                        'selected' => $action == 'websitemonetization',
                        'hidden'   => !$user_is_partner
                    ],
                    [
                        'label'    => __('Partner Agreement'),
                        'href'     => $settingsRequest->setParameter('action', 'partneragreement')->buildURI(),
                        'selected' => $action == 'partneragreement',
                        'locked'   => !$user_is_partner,
                    ],
                    [
                        'label'    => __('Revenue Analytics') . ' <i class="icon-link font-xs neutral-3_color"></i>',
                        'href'     => '/stats/' . $username . '/videomonetization',
                        'selected' => false,
                        'locked'   => !$user_is_partner,
                    ],
                ]
            ];
        }

        // ACCOUNT SETTINGS
        $menuData['account'] =
        [
            'title' => __('Account'),
            'links' =>
            [
                [
                    'label'    => __('Account Settings'),
                    'href'     => $settingsRequest->setParameter('action', 'account')->buildURI(),
                    'selected' => $action === 'account'
                ],
                [
                    'label'    => '<i class="show-sites-warning icon-alert warning_color" style="display:none;"></i> ' . __('Your Sites'),
                    'href'     => $settingsRequest->setParameter('action', 'yoursites')->buildURI(),
                    'selected' => $action == 'yoursites',
                    'hidden'   => !$user_is_partner
                ],
                [
                    'label'    => __('Payments'),
                    'href'     => $settingsRequest->setParameter('action', 'payments')->buildURI(),
                    'selected' => $action == 'payments',
                    'hidden'   => !$user_is_partner
                ],
                [
                    'label'    => '<i class="banking-menu-warning-icon warning_color hidden media-img mrg-end-md icon icon-warning_sign"></i> ' . __('Banking Info'),
                    'href'     => $settingsRequest->setParameter('action', 'bankinginfos')->buildURI(),
                    'selected' => $action == 'bankinginfos',
                    'hidden'   => !$user_is_partner
                ]
            ]
        ];

        // CONTENT PROTECTION
        if ($user->hasCriteria('role', 'can-set-claim-rules')){
            $menuData['content-protection'] =
            [
                'title' => __('Content Protection'),
                'links' =>
                [
                    [
                        'label'    => __('Business Rules'),
                        'href'     => $settingsRequest->setParameter('action', 'business-rules')->buildURI(),
                        'selected' => $action === 'business-rules'
                    ],
                    // This section cannot exist as of now since contracts have been signed offline and are diverse.
                    // [
                    //     'label'    => __('Terms Of Use'),
                    //     'href'     => $settingsRequest->setParameter('action', 'business-rules-tos')->buildURI(),
                    //     'selected' => $action == 'business-rules-tos',
                    //     'hidden'   => !$user_is_partner
                    // ]
                ]
            ];
        }

        // ADVERTISING
        $menuData['advertising'] =
        [
            'title' => __('Advertising'),
            'links' =>
            [
                [
                    'label'    => '<span class="badge badge--partner mrg-end-md">NEW</span>' . __('Promoted Videos'),
                    'href'     => $settingsRequest->setParameter('action', 'promotedvideos')->buildURI(),
                    'selected' => $action === 'promotedvideos'
                ],
            ]
        ];

        // ADVANCED
        $menuData['advanced'] =
        [
            'title' => __('Advanced'),
            'links' =>
            [
                [
                    'label'    => __('API Keys'),
                    'href'     => $settingsRequest->setParameter('action', 'developer')->buildURI(),
                    'selected' => $action == 'developer'
                ],
                [
                    'label'    => __('Connections'),
                    'href'     => $settingsRequest->setParameter('action', 'connections')->buildURI(),
                    'selected' => $action == 'connections'
                ]
            ]
        ];

        // MCN :- check if the user is eligible to invite other users
        if($user->hasRole('can-invite-users')){
            $menuData['MCN'] =
            [
                'title' => __('MCN'),
                'links' =>
                [
                    [
                        'label'    => __('MCN Agreement'),
                        'href'     => $settingsRequest->setParameter('action', 'mcnagreement')->buildURI(),
                        'selected' => $action == 'mcnagreement'
                    ],
                    [
                        'label'    => __('Your Network'),
                        'href'     => $settingsRequest->setParameter('action', 'mcnnetwork')->buildURI(),
                        'selected' => $action == 'mcnnetwork'
                    ],
                    [
                        'label'    => __('Channel Rollup'),
                        'href'     => $settingsRequest->setParameter('action', 'mcninvitechannels')->buildURI(),
                        'selected' => $action == 'mcninvitechannels'
                    ]
                ]
            ];
        }

        if ($user_is_partner){
            $menuData['advanced']['links'][] =
                [
                    'label'    => __('Analytics'),
                    'href'     => $settingsRequest->setParameter('action', 'analyticstools')->buildURI(),
                    'selected' => $action == 'analyticstools'
                ];
        }

        return $menuData;
    }

    private function addLinkToMenu(&$menu, $position, $link)
    {
        $menu = array_slice($menu, 0, $position, true) +
            array("" => $link) +
            array_slice($menu, $position, count($menu) - 1, true) ;
    }
}

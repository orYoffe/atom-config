<?php

if (DM_GateKeeper::match('PAGE_PLAYER_DEGRADED', $request)) {
    $webpackConf = [
        'WEBPACK_STATS_PATH' => 'cache/webpack_files_map.conf-player-page-degraded.php',
        'WEBPACK_COMMON_BUNDLE_NAME' => DM_Config::getValue('WEBPACK_COMMON_BUNDLE_NAME'),
        'WEBPACK_PUBLIC_PATH' =>  '/' . DM_Config::getValue('WEBPACK_OUTPUT_PATH') . '-player-page-degraded/'
    ];
    Webpack::init($webpackConf);
    $bundleUrl = Webpack::getBundleUrl('video_page-player-degraded');
    $jqueryUrl = DM::getJsUrl('/js/lib/jquery-1.9.0.min.js');

    $cssCommon = DM::getCssPackUrl('common');
    $cssVideo = DM::getCssPackUrl('video');

    $assetsMap = Helper_StaticAssets::getJSONHashs(['#masscast_iframed']);

    $staticData = json_encode([
        'logoRetinaUrl' => DM::getStaticURL('/images/header/logo_dailymotion@2x.png'),
        'version' => DM_LocaleV2::getSiteVersion(),
        'content_version' => DM_LocaleV2::getSiteVersion(),
        'videoId' => $request->getParameter('video'),
        'facebookScriptUrl' => Helper_Facebook::getScriptUrl(),
        'FBAppId' => DM_Config::getValue('FACEBOOK_APP_ID'),
        'rfc1766_language' => DM_LocaleV2::getRFc1766Language()
    ]);

    echo <<<EOT
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dailymotion</title>
        <link href="$cssCommon" rel="stylesheet"/>
        <link href="$cssVideo" rel="stylesheet"/>
        <script>
            DMAssetsMap=$assetsMap;
        </script>
    </head>
    <body class="responsive-grid lt_site pg_video">
        <div id="root"></div>
        <script>var INITIAL_DATA = $staticData;</script>
        <script src="$jqueryUrl"></script>
        <script src="$bundleUrl"></script>
        <div id="fb-root"></div>
        <div id="twitter-root"></div>
    </body>
    </html>
EOT;
}
else {
    die();
    $controller = new Page_VideoController();
    $controller->render();
}

<?php
if (DM_GateKeeper::match('ALGOLIA_SEARCH_DESKTOP', $request))
{
    r()->redirect('/#search/' . $request->getParameter('search'));
}
if ($request->getReqCriteria('channel') == 'sexy' || $request->getReqCriteria('channel') == 'gaylesbian')
{
    return $request->redirect($request->dup()->setReqCriteria('channel', 'redband'),301);
}

if (($request->hasReqCriteria('cluster') || $request->hasReqCriteria('channel'))
    && in_array($request->getReqCriteria('cluster'), array('sexy', 'flirt', 'redband'))
    && DM_FamilyFilter::getFilter() == 'on')
{
    return r()->redirect('/family_filter?urlback=' . urlencode($request->getRequestURI()));
}

if ($request->isRequestedChannelHome())
{
    $controller = new Page_WhatToWatchController();
    $controller->render();

    return;
}


if ($request->getRouteName() == 'channel_home')
{
    $url = r('@video_list')
            ->setParameter('channel', $request->getParameter('channel'))
            ->setParameter('localization', $request->getParameter('localization'))
            ->setParameter('pagination', '1');
    $request->redirect($url);
}
else
{
    if (r()->hasReqFilter('with-poster'))
    {
        $controller = new Page_MoviesController();
    }
    else
    {
        $controller = new Page_VideosController();
    }
}

$controller->render();

return;

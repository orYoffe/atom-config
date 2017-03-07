<?php

$videoId = $request->getParameter('video_id');
$video = DM_Video::getInstance($videoId);
$positions = ['Middle', 'Top', 'Bottom', 'Right', 'x29', 'x53'];

if (!(DM_GateKeeper::match('DISPLAYADS_VIDEOPAGE_B', r()))) 
{
    $positions = ['Middle', 'Top', 'x29', 'x53'];
} 
elseif (!(DM_GateKeeper::match('DISPLAYADS_VIDEOPAGE_C', r()))) 
{
    $positions = ['Middle', 'Top', 'Bottom', 'x29', 'x53'];
} 
else 
{
    $positions = ['Middle', 'Top', 'Bottom', 'Right', 'x29', 'x53'];
}

$masscastInstance = Helper_Masscast::getInstance('videoplayer', [
    'explicit' => $video->isExplicit(),
    'no_frame' => false,
    'positions' => $positions
]);


echo json_encode([
	'call' => $masscastInstance->getCall(),
	'positions' => $positions
]);
<?php

$videoId = $request->getParameter('video_id');
$video = DM_Video::getInstance($videoId);
$right_position_allowed = (!(DM_GateKeeper::match('DISPLAYADS_VIDEOPAGE_B', r())) && !(DM_GateKeeper::match('DISPLAYADS_VIDEOPAGE_C', r()));
$positions = $right_position_allowed ? ['Middle', 'Top', 'Bottom', 'Right', 'x29', 'x53'] : ['Middle', 'Top', 'Bottom', 'x29', 'x53'];

$masscastInstance = Helper_Masscast::getInstance('videoplayer', [
    'explicit' => $video->isExplicit(),
    'no_frame' => false,
    'positions' => $positions
]);


echo json_encode([
	'call' => $masscastInstance->getCall(),
	'positions' => $positions
]);
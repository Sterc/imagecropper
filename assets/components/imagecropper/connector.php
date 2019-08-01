<?php

/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

require_once dirname(dirname(dirname(__DIR__))) . '/config.core.php';

require_once MODX_CORE_PATH . 'config/' . MODX_CONFIG_KEY . '.inc.php';
require_once MODX_CONNECTORS_PATH . 'index.php';

$modx->getService('imagecropper', 'ImageCropper', $modx->getOption('imagecropper.core_path', null, $modx->getOption('core_path') . 'components/imagecropper/') . 'model/imagecropper/');

if ($modx->imagecropper instanceof ImageCropper) {
    $modx->request->handleRequest([
        'processors_path'   => $modx->imagecropper->config['processors_path'],
        'location'          => ''
    ]);
}

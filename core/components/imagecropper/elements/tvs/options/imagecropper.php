<?php

/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

$modx->getService('ImageCropper', 'ImageCropper', $modx->getOption('imagecropper.core_path', null, $modx->getOption('core_path') . 'components/imagecropper/') . 'model/imagecropper/');

$modx->smarty->assign('imagecropper', $modx->lexicon->fetch('imagecropper.', true));

return $modx->smarty->fetch($modx->ImageCropper->config['templates_path'] . 'tvs/options/imagecropper.tpl');

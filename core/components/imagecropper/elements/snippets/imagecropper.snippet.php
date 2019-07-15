<?php
/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

$instance = $modx->getService('ImageCropperSnippet', 'ImageCropperSnippet', $modx->getOption('imagecropper.core_path', null, $modx->getOption('core_path') . 'components/imagecropper/') . 'model/imagecropper/snippets/');

if ($instance instanceof ImageCropperSnippet) {
    return $instance->run($scriptProperties);
}

return '';
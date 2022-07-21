<?php
/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

$class = $modx->loadClass('ImageCropperSnippet', $modx->getOption('imagecropper.core_path', null, $modx->getOption('core_path') . 'components/imagecropper/') . 'model/imagecropper/snippets/', false, true);

if ($class) {
    $instance = new $class($modx);

    if ($instance instanceof ImageCropperSnippet) {
        return $instance->run($scriptProperties);
    }
}

return '';
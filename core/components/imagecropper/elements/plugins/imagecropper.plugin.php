<?php
/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

if (in_array($modx->event->name, ['OnManagerPageInit', 'OnTVInputRenderList', 'OnTVInputPropertiesList'], true)) {
    $instance = $modx->getService('ImageCropperPlugins', 'ImageCropperPlugins', $modx->getOption('imagecropper.core_path', null, $modx->getOption('core_path') . 'components/imagecropper/') . 'model/imagecropper/');

    if ($instance instanceof ImageCropperPlugins) {
        $method = lcfirst($modx->event->name);

        if (method_exists($instance, $method)) {
            $instance->$method($scriptProperties);
        }
    }
}

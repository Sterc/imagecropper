<?php

/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

class ImageCropperInputRender extends modTemplateVarInputRender
{
    /**
     * @access public.
     * @param Mixed $value.
     * @param Array $params.
     * @return Mixed.
     */
    public function process($value, array $params = [])
    {
        $this->modx->getService('ImageCropper', 'ImageCropper', $this->modx->getOption('imagecropper.core_path', null, $this->modx->getOption('core_path') . 'components/imagecropper/') . 'model/imagecropper/');

        $this->setPlaceholder('sizes', $this->modx->getOption('sizes', $params, '[]'));
        $this->setPlaceholder('previews', (bool) $this->modx->getOption('previews', $params, 1) ? 'true' : 'false');

        if ($this->modx->resource) {
            $this->setPlaceholder('resource', $this->modx->resource->get('id'));

            $source = $this->tv->getSource($this->modx->resource->get('context_key'));

            if ($source) {
                $this->setPlaceholder('source', $source->get('id'));
                $this->setPlaceholder('basePath', $source->getProperties()['basePath']['value']);
            }
        }
    }

    /**
     * @access public.
     * @return String.
     */
    public function getTemplate()
    {
        return $this->modx->ImageCropper->config['templates_path'] . 'tvs/input/imagecropper.tpl';
    }
}

return 'ImageCropperInputRender';

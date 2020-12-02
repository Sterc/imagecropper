<?php

/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

class ImageCropperCropProcessor extends modProcessor
{
    /**
     * @access public.
     * @var Array.
     */
    public $languageTopics = ['imagecropper:default'];

    /**
     * @access public.
     * @return Mixed.
     */
    public function initialize()
    {
        $this->modx->getService('ImageCropper', 'ImageCropper', $this->modx->getOption('imagecropper.core_path', null, $this->modx->getOption('core_path') . 'components/imagecropper/') . 'model/imagecropper/');

        $this->_getSource();

        return parent::initialize();
    }

    /**
     * @access public.
     * @return Mixed.
     */
    public function process()
    {
        $filename = (string)$this->getProperty('image');

        // Remove site url
        $siteUrl = $this->modx->getOption('site_url');
        if (strpos($filename, $siteUrl) === 0) {
            $filename = substr($filename, strlen($siteUrl));
        }

        // Remove source-specific base url
        $baseUrl = $this->source->getBaseUrl();
        $baseUrl = ltrim($baseUrl, '/');
        $filename = ltrim($filename, '/');
        if (strpos($filename, $baseUrl) === 0) {
            $filename = substr($filename, strlen($baseUrl));
        }

        // Try to load the image
        $file = $this->source->getObjectContents($filename);
        $file = $file['content'];
        if (empty($file)) {
            return $this->failure('File ' . $filename . ' not found in source ' . $this->source->get('id'));
        }

        $base   = rtrim($this->modx->getOption('base_path', null, MODX_BASE_PATH), '/') . '/';
        $image  = ltrim($this->getProperty('image'), '/');

        if (!empty($image)) {
            if (!empty($file)) {
                $imageName      = substr($image, strrpos($image, '/') + 1);
                $imageExtension = substr($image, strrpos($image, '.') + 1);
                $imagePrefix    = substr($imageName, 0, strrpos($imageName, '.'));
                $imageHash      = $this->getProperty('cropWidth') . $this->getProperty('cropHeight') . $this->getProperty('x') . $this->getProperty('y') . $this->getProperty('scaleX') . $this->getProperty('scaleY');

                if (empty($this->modx->ImageCropper->config['crop_path'])) {
                    $imagePath  = trim(substr($image, 0, strrpos($image, '/') + 1), '/') . '/imagecropper/';
                } else {
                    $imagePath  = rtrim($this->modx->ImageCropper->config['crop_path'], '/') . '/';
                }

                $pathPlaceholders = $this->getPlaceholders();

                $imagePath = str_replace(array_keys($pathPlaceholders), array_values($pathPlaceholders), $imagePath);

                /**
                 * Make sure the upload path exists.
                 * We unset errors to prevent issues if it already exists.
                 */
                $this->source->createContainer($imagePath, '/');
                $this->source->errors = array();

                if (in_array(strtolower($imageExtension), ['jpg', 'jpeg', 'png', 'gif'], true)) {
                    $cropName       = $imagePrefix . '-' . md5($imageHash) . '.' . $imageExtension;
                    $cropImage      = rtrim($imagePath, '/') . '/' . $cropName;

                    $source         = imagecreatefromstring($file);

                    if ((int) $this->getProperty('scaleX') === -1) {
                        imageflip($source, IMG_FLIP_HORIZONTAL);
                    }

                    if ((int) $this->getProperty('scaleY') === -1) {
                        imageflip($source, IMG_FLIP_VERTICAL);
                    }
                    $cropSource     = imagecreatetruecolor((int) $this->getProperty('cropWidth'), (int) $this->getProperty('cropHeight'));
                    $canvasSource   = imagecreatetruecolor((int) $this->getProperty('canvasWidth'), (int) $this->getProperty('canvasHeight'));

                    imagealphablending($source, true);

                    imagealphablending($cropSource, false);
                    imagesavealpha($cropSource, true);
                    imagefill($cropSource, 0, 0, imagecolorallocatealpha($cropSource, 0, 0, 0, 127));

                    imagealphablending($canvasSource, false);
                    imagesavealpha($canvasSource, true);
                    imagefill($canvasSource, 0, 0, imagecolorallocatealpha($canvasSource, 0, 0, 0, 127));

                    imagecopyresampled($canvasSource, $source, - (int) $this->getProperty('x'), - (int) $this->getProperty('y'), 0, 0, (int) $this->getProperty('imageWidth'), (int) $this->getProperty('imageHeight'), (int) $this->getProperty('imageWidth'), (int) $this->getProperty('imageHeight'));
                    imagecopyresampled($cropSource, $canvasSource, 0, 0, 0, 0, (int) $this->getProperty('cropWidth'), (int) $this->getProperty('cropHeight'), (int) $this->getProperty('canvasWidth'), (int) $this->getProperty('canvasHeight'));

                    ob_start();
                    if (strtolower($imageExtension) === 'jpg') {
                        imagejpeg($cropSource);
                    } else if (strtolower($imageExtension) === 'jpeg') {
                        imagejpeg($cropSource);
                    } else if (strtolower($imageExtension) === 'png') {
                        imagepng($cropSource);
                    } else if (strtolower($imageExtension) === 'gif') {
                        imagegif($cropSource);
                    }
                    $result = ob_get_clean();

                    imagedestroy($source);
                    imagedestroy($cropSource);
                    imagedestroy($canvasSource);

                    if ($result) {
                        if ($this->source->createObject($imagePath, $cropName, $result)
                            || $this->source->updateObject($imagePath, $cropName, $result)
                        ) {
                            $url = $this->source->getObjectUrl($imagePath . $cropName);
                            return $this->success($this->modx->lexicon('imagecropper.success_image'), [
                                'image'     => $url,
                                'width'     => $this->getProperty('cropWidth'),
                                'height'    => $this->getProperty('cropHeight')
                            ]);
                        }

                        return $this->failure($this->modx->lexicon('imagecropper.error_crop'));
                    }

                    return $this->failure($this->modx->lexicon('imagecropper.error_image'));
                }

                return $this->failure($this->modx->lexicon('imagecropper.error_image_not_valid'));
            }

            return $this->failure($this->modx->lexicon('imagecropper.error_image_not_exists'));
        }

        return $this->failure($this->modx->lexicon('imagecropper.error_image_not_set'));
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getPlaceholders()
    {
        return [
            '[[+year]]'     => date('Y'),
            '[[+month]]'    => date('m'),
            '[[+day]]'      => date('d'),
            '[[+user]]'     => $this->modx->getUser()->get('id'),
            '[[+username]]' => $this->modx->getUser()->get('username'),
            '[[+resource]]' => $this->getProperty('resource')
        ];
    }

    /**
     * @return modMediaSource|null
     */
    public function _getSource() {
        if ($this->source) return $this->source;

        $id = $this->getProperty('source');

        $this->modx->loadClass('sources.modMediaSource');
        $this->source = modMediaSource::getDefaultSource($this->modx, $id);

        if ($this->source) {
            $this->source->getWorkingContext();
            $this->source->initialize();
            return $this->source;
        }
        return null;
    }
}

return 'ImageCropperCropProcessor';

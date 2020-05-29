<?php

/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

class ImageCropper
{
    /**
     * @access public.
     * @var modX.
     */
    public $modx;

    /**
     * @access public.
     * @var Array.
     */
    public $config = [];

    /**
     * @access public.
     * @param modX $modx.
     * @param Array $config.
     */
    public function __construct(modX &$modx, array $config = [])
    {
        $this->modx =& $modx;

        $corePath   = $this->modx->getOption('imagecropper.core_path', $config, $this->modx->getOption('core_path') . 'components/imagecropper/');
        $assetsUrl  = $this->modx->getOption('imagecropper.assets_url', $config, $this->modx->getOption('assets_url') . 'components/imagecropper/');
        $assetsPath = $this->modx->getOption('imagecropper.assets_path', $config, $this->modx->getOption('assets_path') . 'components/imagecropper/');

        $this->config = array_merge([
            'namespace'             => 'imagecropper',
            'lexicons'              => ['imagecropper:default'],
            'base_path'             => $corePath,
            'core_path'             => $corePath,
            'model_path'            => $corePath . 'model/',
            'processors_path'       => $corePath . 'processors/',
            'elements_path'         => $corePath . 'elements/',
            'chunks_path'           => $corePath . 'elements/chunks/',
            'plugins_path'          => $corePath . 'elements/plugins/',
            'snippets_path'         => $corePath . 'elements/snippets/',
            'templates_path'        => $corePath . 'templates/',
            'assets_path'           => $assetsPath,
            'js_url'                => $assetsUrl . 'js/',
            'css_url'               => $assetsUrl . 'css/',
            'assets_url'            => $assetsUrl,
            'connector_url'         => $assetsUrl . 'connector.php',
            'version'               => '1.3.0',
            'crop_path'             => $this->modx->getOption('imagecropper.crop_path'),
            'auto_open_cropper'     => (bool) $this->modx->getOption('imagecropper.auto_open_cropper')
        ], $config);

        $this->modx->addPackage('imagecropper', $this->config['model_path']);

        if (is_array($this->config['lexicons'])) {
            foreach ($this->config['lexicons'] as $lexicon) {
                $this->modx->lexicon->load($lexicon);
            }
        } else {
            $this->modx->lexicon->load($this->config['lexicons']);
        }
    }
}

<?php

/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

require_once dirname(__DIR__) . '/imagecroppersnippets.class.php';

class ImageCropperSnippet extends ImageCropperSnippets
{
    /**
     * @access public.
     * @var Array.
     */
    public $properties = [
        'attributes'            => '',
        'field'                 => null,

        'tpl'                   => '@FILE elements/chunks/image.chunk.tpl',

        'usePdoTools'           => false,
        'usePdoElementsPath'    => false
    ];

    /**
     * @access public.
     * @param Array $properties.
     * @return String.
     */
    public function run(array $properties = [])
    {
        $this->setProperties($properties);

        $image = $this->getProperty('image');

        if (!empty($image)) {
            $data = json_decode($image, true);

            if (!$data) {
                $data = [
                    'image' => $image
                ];
            }

            if (isset($data['image'])) {
                $output = [
                    'image' => '/' . ltrim($data['image'], '/')
                ];

                if (isset($data['sizes'])) {
                    foreach ((array) $data['sizes'] as $key => $size) {
                        $output[$key] = [
                            'image'     =>  '/' . ltrim($size['image'], '/'),
                            'width'     => $size['width'],
                            'height'    => $size['height']
                        ];
                    }
                }

                $field = $this->getProperty('field', null);

                if ($field !== null) {
                    if (isset($output[$field])) {
                        return $output[$field]['image'];
                    }

                    if ($field === 'json') {
                        return $this->getProperty('image');
                    }

                    return $output['image'];
                }

                $attributes = array_merge(['class', 'alt', 'title'], explode(',', $this->getProperty('attributes', '')));

                foreach ((array) $properties as $key => $property) {
                    if (in_array($key, $attributes, true)) {
                        $output[$key] = $property;
                    }
                }

                return $this->getChunk($this->getProperty('tpl'), $output);
            }
        }

        return '';
    }
}

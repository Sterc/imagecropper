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

        $image = json_decode($this->getProperty('image', '[]'), true);

        if ($image && isset($image['image'])) {
            $data = [
                'image' => $image['image']
            ];

            if (isset($image['sizes'])) {
                foreach ((array) $image['sizes'] as $key => $size) {
                    $data[$key] = [
                        'image'     => $size['image'],
                        'width'     => $size['width'],
                        'height'    => $size['height']
                    ];
                }
            }

            $field = $this->getProperty('field', null);

            if ($field !== null) {
                if ($field === 'default') {
                    return $data['image'];
                }

                if (isset($data[$field])) {
                    return $data[$field]['image'];
                }

                return $this->getProperty('image');
            }

            $attributes = array_merge(['class', 'alt', 'title'], explode(',', $this->getProperty('attributes', '')));

            foreach ((array) $properties as $key => $property) {
                if (in_array($key, $attributes, true)) {
                    $data[$key] = $property;
                }
            }

            return $this->getChunk($this->getProperty('tpl'), $data);
        }

        return $this->getProperty('image');
    }
}

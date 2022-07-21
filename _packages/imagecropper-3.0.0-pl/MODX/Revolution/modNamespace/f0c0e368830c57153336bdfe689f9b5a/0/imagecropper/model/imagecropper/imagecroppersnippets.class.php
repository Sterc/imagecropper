<?php

/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

require_once __DIR__ . '/imagecropper.class.php';

class ImagecropperSnippets extends ImageCropper
{
    /**
     * @access public.
     * @var Array.
     */
    public $properties = [];

    /**
     * @access public.
     * @param String $key.
     * @param Mixed $value.
     */
    public function setProperty($key, $value)
    {
        $this->properties[$key] = $value;
    }

    /**
     * @access public.
     * @param String $key.
     * @param Mixed $default.
     * @return Mixed.
     */
    public function getProperty($key, $default = null)
    {
        if (isset($this->properties[$key])) {
            return $this->properties[$key];
        }

        return $default;
    }

    /**
     * @access public.
     * @param Array $properties.
     */
    public function setProperties(array $properties = [])
    {
        foreach ($properties as $key => $value) {
            $this->setProperty($key, $value);
        }
    }

    /**
     * @access public.
     * @return Array.
     */
    public function getProperties()
    {
        return $this->properties;
    }

    /**
     * @access public.
     * @param String $name.
     * @param Array $properties.
     * @return String.
     */
    public function getChunk($name, array $properties = [])
    {
        if (class_exists('pdoTools') && $pdo = $this->modx->getService('pdoTools')) {
            if ((bool) $this->getProperty('usePdoTools')) {
                if ((bool) $this->getProperty('usePdoElementsPath')) {
                    $elementsPath = $this->modx->getOption('pdotools_elements_path');
                } else {
                    $elementsPath = $this->getProperty('elementsPath', $this->config['core_path']);
                }

                return $pdo->getChunk($name, array_merge([
                    'elementsPath' => $elementsPath
                ], $properties));
            }
        }

        $type = 'CHUNK';

        if (strpos($name, '@') === 0) {
            $type = substr($name, 1, strpos($name, ' ') - 1);
            $name = ltrim(substr($name, strpos($name, ' ') + 1, strlen($name)));
        }

        switch (strtoupper($type)) {
            case 'FILE':
                if (false !== strrpos($name, '.')) {
                    $name = $this->config['core_path'] . $name;
                } else {
                    $name = $this->config['core_path'] . $name . '.chunk.tpl';
                }

                if (file_exists($name)) {
                    $chunk = $this->modx->newObject('modChunk', [
                        'name' => $this->config['namespace'] . uniqid()
                    ]);

                    if ($chunk) {
                        $chunk->setCacheable(false);

                        return $chunk->process($properties, file_get_contents($name));
                    }
                }

                break;
            case 'INLINE':
                $chunk = $this->modx->newObject('modChunk', [
                    'name' => $this->config['namespace'] . uniqid()
                ]);

                if ($chunk) {
                    $chunk->setCacheable(false);

                    return $chunk->process($properties, $name);
                }

                break;
        }

        return $this->modx->getChunk($name, $properties);
    }
}

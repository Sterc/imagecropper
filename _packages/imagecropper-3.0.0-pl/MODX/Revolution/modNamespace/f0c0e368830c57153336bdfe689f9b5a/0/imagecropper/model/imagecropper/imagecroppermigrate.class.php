<?php

/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

require_once __DIR__ . '/imagecropper.class.php';

class ImageCropperMigrate extends ImageCropper
{
    /**
     * @access protected.
     * @var Array.
     */
    protected $timer = [
        'start' => null,
        'end'   => null,
        'time'  => null
    ];

    /**
     * @access protected.
     * @var Array.
     */
    protected $logs = [
        'log'   => [],
        'html'  => [],
        'clean' => []
    ];


    /**
     * @access public.
     * @return String.
     */
    public function run()
    {
        $this->setTimer('start');

        $tvs = $this->modx->getCollection('modTemplateVar', ['type' => 'imagecropper']);
        $this->log('Migrating ' . count($tvs) . ' existing tvs');
        foreach ($tvs as $tv) {
            $values = $this->modx->getCollection('modTemplateVarResource', ['tmplvarid' => $tv->get('id')]);
            $this->log('Start processing ' . count($values) . ' values for ' . $tv->get('name'));

            $srcPath = $this->getMediasourcePath($tv->get('source'));

            foreach ($values as $value) {
                if ($this->is_json($value->get('value'))) {
                    $data = $this->modx->fromJSON($value->get('value'));

                    if (array_key_exists('sourceImg', $data)) {
                        $value->set('value', $data['sourceImg']['src']);
                        $this->log('Value ID:' . $value->get('id') . ' was imagePlus', 'notice');
                    } else {
                        $this->log('Value ID:' . $value->get('id') . ' has been skipped because value is already migrated', 'notice');
                        continue;
                    }
                }

                if (strpos($value->get('value'), $srcPath) === false) {
                    $value->set('value', $srcPath . $value->get('value'));
                }

                $image = ['image' =>  $value->get('value')];
                $value->set('value', $this->modx->toJSON($image));
                $value->save();
            }

            $this->log('Finished processing ' . count($values) . ' values for ' . $tv->get('name'));
        }

        $this->setTimer('end');
    }

    /**
     * @access protected.
     * @param String $type.
     */
    protected function setTimer($type)
    {
        $this->timer[$type] = microtime(true);

        switch ($type) {
            case 'start':
                $this->log('Start migration process at ' . date('d-m-Y H:i:s') . '.');

                break;
            case 'end':
                $this->timer['time'] = $this->timer['end'] - $this->timer['start'];

                $this->log('End migration process at ' . date('d-m-Y H:i:s') . '.');
                $this->log('Total execution time in seconds: ' . number_format($this->timer['time'], 2) . '.');

                break;
        }
    }

    /**
     * @access protected.
     * @param String $message.
     * @param String $level.
     */
    protected function log($message, $level = 'info')
    {
        switch ($level) {
            case 'error':
                $prefix = 'ERROR::';
                $color = 'red';
                break;
            case 'notice':
                $prefix = 'NOTICE::';
                $color = 'yellow';
                break;
            case 'success':
                $prefix = 'SUCCESS::';
                $color = 'green';
                break;
            default:
                $prefix = 'INFO::';
                $color = 'blue';

                break;
        }

        $log    = $this->colorize($prefix, $color) . ' ' . $message;
        $html   = '<span style="color: ' . $color . '">' . $prefix . '</span> ' . $message;

        if (XPDO_CLI_MODE) {
            $this->modx->log(MODX_LOG_LEVEL_INFO, $log);
        } else {
            $this->modx->log(MODX_LOG_LEVEL_INFO, $html);
        }

        /*
         * logMessage has CLI markup
         * htmlMessage has HTML markup
         * cleanMessage has no markup
         */
        $this->logs['log'][]   = $log;
        $this->logs['html'][]  = $html;
        $this->logs['clean'][] = $prefix . ' ' . $message;
    }

    /**
     * @access protected.
     * @param String $string.
     * @param String $color.
     * @return String.
     */
    protected function colorize($string, $color = 'white')
    {
        switch ($color) {
            case 'red':
                return "\033[31m" . $string . "\033[39m";

                break;
            case 'green':
                return "\033[32m" . $string . "\033[39m";

                break;
            case 'yellow':
                return "\033[33m" . $string . "\033[39m";

                break;
            case 'blue':
                return "\033[34m" . $string . "\033[39m";

                break;
            default:
                return $string;

                break;
        }
    }

    /**
     * @access protected.
     * @param String $string.
     * @return Boolean.
     */
    protected function is_json($string)
    {
        if (json_decode($string)) {
            return true;
        }

        return json_last_error() === JSON_ERROR_NONE;
    }

    /**
     * @access protected.
     * @param Integer $source.
     * @return String.
     */
    protected function getMediasourcePath($source)
    {
        $mediasource = $this->modx->getObject('modMediaSource', [
            'id' => $source
        ]);

        if ($mediasource) {
            $properties = $mediasource->getProperties();

            if (isset($properties['basePath'])) {
                return $properties['basePath']['value'];
            }
        }

        return '';
    }
}

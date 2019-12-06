<?php
/**
 * ImageCropper migration script
 * Migrates values of changed image tv to imagecropper values
 * php /assets/components/imagecropper/migration/imagecropper.migrate.php --hash=
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

require_once dirname(dirname(dirname(dirname(__DIR__)))) . '/config.core.php';
require_once MODX_CORE_PATH . 'model/modx/modx.class.php';

$modx = new modX();
$modx->initialize('web');

$modx->getService('error', 'error.modError');
$modx->setLogLevel(modX::LOG_LEVEL_INFO);
$modx->setLogTarget(XPDO_CLI_MODE ? 'ECHO' : 'HTML');

/*
 * Put the options in the $options variable.
 * We use getopt for CLI executions and $_GET for http executions.
 */
$options = [];

if (XPDO_CLI_MODE) {
    $options = getopt('', ['hash::']);
} else {
    $options = $_GET;
}

if (!isset($options['hash']) || $options['hash'] !== $modx->getOption('imagecropper.migration_hash')) {
    $modx->log(modX::LOG_LEVEL_INFO, 'ERROR:: Cannot initialize migration, no valid hash provided.');

    exit();
}

$instance = $modx->getService('ImageCropperMigrate', 'ImageCropperMigrate', $modx->getOption('imagecropper.core_path', null, $modx->getOption('core_path') . 'components/imagecropper/') . 'model/imagecropper/');

if ($instance instanceof ImageCropperMigrate) {
    return $instance->run();
}

return '';

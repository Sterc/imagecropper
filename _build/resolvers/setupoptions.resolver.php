<?php

/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

$package = 'ImageCropper';

$settings = ['user_name', 'user_email', 'migration_hash'];

$success = false;

switch ($options[xPDOTransport::PACKAGE_ACTION]) {
    case xPDOTransport::ACTION_INSTALL:
    case xPDOTransport::ACTION_UPGRADE:
        foreach ($settings as $key) {
            $setting = $object->xpdo->getObject('modSystemSetting', [
                'key' => strtolower($package) . '.' . $key
            ]);

            if (!$setting) {
                $setting = $object->xpdo->newObject('modSystemSetting');
                $setting->set('key', strtolower($package) . '.' . $key);

                if ($setting === 'migration_hash') {
                    $setting->set('value', md5(uniqid(rand(), true)));
                    $setting->save();
                }
            }
            if (isset($options[$key])) {
                $setting->set('value', $options[$key]);
                $setting->save();
            }
        }

        $success = true;

        break;
    case xPDOTransport::ACTION_UNINSTALL:
        $success = true;

        break;
}

return $success;

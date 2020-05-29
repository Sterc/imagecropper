<?php

/**
 * ImageCropper
 *
 * Copyright 2019 by Sterc <modx@sterc.nl>
 */

$_lang['imagecropper']                                  = 'Image crop';

$_lang['area_imagecropper']                             = 'Image crop';

$_lang['setting_imagecropper.migration_hash']           = 'Migration hash';
$_lang['setting_imagecropper.migration_hash_desc']      = 'The hash of the migration, this hash needs to be send as a parameter with the migration.';
$_lang['setting_imagecropper.crop_path']                = 'Image crops location';
$_lang['setting_imagecropper.crop_path_desc']           = 'The location where the image crops will be stored. This supports [[+year]], [[+month]], [[+day]], [[+user]], [[+username]] and [[+resource]] placeholers.';
$_lang['setting_imagecropper.auto_open_cropper']        = 'Open image crop';
$_lang['setting_imagecropper.auto_open_cropper_desc']   = 'Open the image crop when an image is selected.';

$_lang['imagecropper.property.y']                       = 'Lefttop Y';
$_lang['imagecropper.property.x']                       = 'Lefttop X';
$_lang['imagecropper.property.width']                   = 'Width';
$_lang['imagecropper.property.height']                  = 'Height';
$_lang['imagecropper.property.original']                = 'Original: [[+width]] x [[+height]]px';
$_lang['imagecropper.advanced']                         = 'Advanced';
$_lang['imagecropper.sets']                             = 'Select a crop';
$_lang['imagecropper.save']                             = 'Create crop';
$_lang['imagecropper.reset']                            = 'Reset';
$_lang['imagecropper.changes.title']                    = 'Warning';
$_lang['imagecropper.changes.content']                  = 'Not all changes are saved, do you want to continue?';
$_lang['imagecropper.remove.title']                     = 'Warning';
$_lang['imagecropper.remove.content']                   = 'Are you sure you want to delete the image and crops?';
$_lang['imagecropper.changes_saved']                    = 'Changes saved.';
$_lang['imagecropper.changes_unsaved']                  = 'There are unsaved changes.';
$_lang['imagecropper.saving']                           = 'Busy with saving...';
$_lang['imagecropper.error_image_not_set']              = 'No image defined.';
$_lang['imagecropper.error_image_not_exists']           = 'The defined image does not exist.';
$_lang['imagecropper.error_image_not_valid']            = 'The defined image is not a correct file.';
$_lang['imagecropper.error_image']                      = 'The crop could not be saved.';
$_lang['imagecropper.success_image']                    = 'Crop saved.';
$_lang['imagecropper.default']                          = 'Original';
$_lang['imagecropper.option_sets']                      = 'Crops';
$_lang['imagecropper.option_sets_desc']                 = 'A defined JSON for the crops, for example {"desktop": {"name": "Desktop", "size": "1000x500"}, "mobile": {"name": "Mobiel", "size": "768x500"}}.';
$_lang['imagecropper.option_previews']                  = 'Show preview';
$_lang['imagecropper.option_previews_desc']             = 'Display the previews of the crops under the field.';

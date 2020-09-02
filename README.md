# MODX ImageCropper
![ImageCropper version](https://img.shields.io/badge/version-1.3.2-brightgreen.svg) ![MODX Extra by Sterc](https://img.shields.io/badge/extra%20by-sterc-magenta.svg) ![MODX version requirements](https://img.shields.io/badge/modx%20version%20requirement-2.4%2B-blue.svg)

Install the ImageCropper extra for image TV with a crop function. 

## Config examples

The following config will have 2 crops. A desktop crop with the size of 1200x500 and a mobile crop with the size of 768x320.
```
{"desktop": {"name": "Desktop", "size": "1200x500"}, "mobile": {"name": "Mobile", "size": "768x320"}}
```

THe following config will have 2 crops. Both crops will have a ratio of 3x1 instead of a fixed size.
```
{"desktop": {"name": "Desktop", "proportion": "3x1"}, "mobile" : {"name": "Mobile", "proportion": "3x1"}}
```

## Example snippet call with a template

Default MODX tags
```
[[!ImageCropper?
    &image=`TV VALUE`
    &tpl=`imageCropperImageTpl`
]]
```

Fenom tags
```
{'!ImageCropper' | snippet : [
    'image' => 'TV VALUE'
    'tpl'   => '@FILE elements/chunks/image.tpl'
}
```

## Example snippet call without a template

The following example will return the crop of the desktop. If there is no crop available it will return the original image. The original image is just the default selected image so I would always pThumb (or phpThumbOf) the image.

```
[[!ImageCropper:pThumb=`w=228&h=298&zc=1`?
    &image=`TV VALUE`
    &field=`desktop`
]]
```

TV crop config for the snippet example above.

```
{"desktop": {"name": "Desktop", "size": "228x298"}}
```

## Parameters

| Parameter                  | Description                                                                 |
|----------------------------|------------------------------------------------------------------------------|
| image | The value of the TV |
| field | [optional] The key of the image to return, for example `desktop` or `mobile`. |
| tpl | [optional] The image template. This can be a chunk , `@FILE` or `@INLINE` |
| usePdoTools | [optional] Set to `true` to use pdoTools in the tpl's and enable fenom. (`@FILE` and `@INLINE` do not require this). Default: `false` |
| usePdoElementsPath | [optional] Set to `true` to use the system setting `pdotools_elements_path` as a base-path for the `@FILE` includes. If `false`, it uses `core/components/imagecropper/`. Default: `false` |

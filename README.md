# MODX ImageCropper
![ImageCropper version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg) ![MODX Extra by Sterc](https://img.shields.io/badge/extra%20by-sterc-magenta.svg) ![MODX version requirements](https://img.shields.io/badge/modx%20version%20requirement-2.4%2B-blue.svg)

Install the ImageCropper extra for image TV with a crop function. 

## Example snippet call

```
{'!ImageCropper' | snippet : [
    'image          => $_modx->resource.imagecropper,
    'usePdoTools'   => true,
    'tpl'           => '@FILE elements/chunks/imagefenom.chunk.tpl'
]}
```

## Parameters

| Parameter                  | Description                                                                 |
|----------------------------|------------------------------------------------------------------------------|
| image | The value of the TV |
| field | [optional] The key of the image to return, for example `mobile`. |
| tpl | [optional] The image template. This can be a chunk , `@FILE` or `@INLINE` |
| usePdoTools | [optional] Set to `true` to use pdoTools in the tpl's and enable fenom. (`@FILE` and `@INLINE` do not require this). Default: `false` |
| usePdoElementsPath | [optional] Set to `true` to use the system setting `pdotools_elements_path` as a base-path for the `@FILE` includes. If `false`, it uses `core/components/imagecropper/`. Default: `false` |
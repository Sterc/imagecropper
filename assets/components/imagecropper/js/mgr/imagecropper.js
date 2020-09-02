var ImageCropper = function(config) {
    config = config || {};

    ImageCropper.superclass.constructor.call(this, config);
};

Ext.extend(ImageCropper, Ext.Component, {
    combo   : {},
    window  : {},
    config  : {}
});

Ext.reg('imagecropper', ImageCropper);

ImageCropper = new ImageCropper();

ImageCropper.combo.Browser = function(config) {
    config = config || {};

    if (config.sizes) {
        if (typeof config.sizes === 'string') {
            config.sizes = Ext.decode(config.sizes);
        }
    }

    if (config.previews) {
        if (typeof config.previews === 'string') {
            config.previews = config.previews === 'true';
        }
    }

    Ext.applyIf(config, {
        width           : 400,
        trigger1Action  : 'file',
        trigger1Class   : 'x-form-image-trigger',
        trigger2Action  : 'crop',
        trigger2Class   : 'x-form-crop-trigger',
        sizes           : config.sizes || {},
        previews        : config.previews || true,
        autoOpen        : ImageCropper.config.auto_open_cropper || false,
        source          : config.source || MODx.config.default_media_source,
        resource        : config.resource || '0'
    });

    ImageCropper.combo.Browser.superclass.constructor.call(this, config);
};

Ext.extend(ImageCropper.combo.Browser, Ext.form.TwinTriggerField, {
    onRender: function(ct, position) {
        ImageCropper.combo.Browser.superclass.onRender.call(this, ct, position);

        this.el.dom.style.position = 'absolute';
        this.el.dom.style.left = '-999999px';

        this.fakeEl         = Ext.DomHelper.insertBefore(this.el, {tag: 'input', type: 'text', cls: 'x-form-text x-form-field'}, true);
        this.previewEl      = Ext.DomHelper.append(this.container, {tag: 'div', cls: 'x-form-imagecropper-preview'}, true);
    },
    onResize: function(aw, ah, w, h) {
        ImageCropper.combo.Browser.superclass.onResize.call(this, aw, ah, w, h);

        this.fakeEl.dom.style.width = this.el.dom.style.width;
    },
    initTrigger: function() {
        this.triggers = this.trigger.select('.x-form-trigger', true);

        this.triggers.each(function(trigger, all, index) {
            if (index === 0) {
                Ext.DomHelper.insertBefore(trigger, {tag: 'div', cls: 'x-form-trigger ' + (this.trigger1Class || '')});
            } else {
                Ext.DomHelper.insertBefore(trigger, {tag: 'div', cls: 'x-form-trigger ' + (this.trigger2Class || '')});
            }

            trigger.remove();
        }, this);

        ImageCropper.combo.Browser.superclass.initTrigger.call(this);
    },
    onTrigger1Click : function(event, btn) {
        if (this.browserWindow) {
            this.browserWindow.destroy();
        }

        this.browserWindow = MODx.load({
            xtype               : 'modx-browser',
            closeAction         : 'close',
            id                  : Ext.id(),
            multiple            : true,
            source              : this.source || MODx.config.default_media_source,
            hideFiles           : this.hideFiles || false,
            rootVisible         : this.rootVisible || false,
            allowedFileTypes    : this.allowedFileTypes || '',
            wctx                : this.wctx || 'web',
            openTo              : this.openTo || '',
            rootId              : this.rootId || '/',
            hideSourceCombo     : this.hideSourceCombo || true,
            listeners           : {
                'select'            : {
                    fn                  : function(data) {
                        this.onSelectImage(data.fullRelativeUrl, event, btn);

                        this.fireEvent('select', data);
                    },
                    scope               : this
                }
            }
        });

        this.browserWindow.show(event);

        return true;
    },
    onTrigger2Click: function(event, btn) {
        if (Ext.isEmpty(this.getValue()) || this.getValue() === '{}') {
            return false;
        }

        if (this.cropImageWindow) {
            this.cropImageWindow.destroy();
        }

        if (btn.dom) {
            var size = btn.dom.dataset.key || 'default';
        } else {
            var size = Ext.get(btn).dom.dataset.key || 'default';
        }

        this.cropImageWindow = MODx.load({
            xtype           : 'imagecropper-window-crop-image',
            closeAction     : 'close',
            cropperSize     : size,
            cropperSizes    : this.sizes || {},
            record          : Ext.decode(this.getValue()),
            resource        : this.resource,
            listeners       : {
                'select'        : {
                    fn              : function(data) {
                        this.setValue(data);
                    },
                    scope           : this
                }
            }
        });

        this.cropImageWindow.show(event);

        return true;
    },
    onSelectImage: function(image, event, btn) {
        this.setValue({
            image : image
        });

        if (this.autoOpen) {
            setTimeout((function() {
                this.onTrigger2Click(event, btn);
            }).bind(this), 100);
        }

        return this;
    },
    setValue: function(value) {
        var rawValue = this.getObjectRawValue(value);

        setTimeout((function() {
            this.el.dom.value = Ext.encode(rawValue);

            if (rawValue.image) {
                this.fakeEl.dom.value = rawValue.image.replace(this.basePath, '');
            } else {
                this.fakeEl.dom.value = '';
            }
        }).bind(this), 100);

        this.onUpdatePreview(rawValue);

        this.fireEvent('change');
    },
    getObjectRawValue: function(value) {
        if (typeof value === 'string') {
            if (value.match(/^{(.*?)}$/gm)) {
                value = Ext.decode(value);
            } else {
                value = {
                    image : value
                };
            }
        }

        return value;
    },
    onUpdatePreview: function(value) {
        if (this.previews) {
            this.previewEl.update('');

            if (!Ext.isEmpty(value.image)) {
                var previews = [{
                    key     : 'default',
                    name    : _('imagecropper.default'),
                    image   : '/' + value.image.replace(/^\/+/g, '')
                }];

                if (!Ext.isEmpty(value.sizes || {})) {
                    Ext.iterate(value.sizes, (function(key, data) {
                        if (this.sizes[key] && data.image) {
                            previews.push({
                                key     : key,
                                name    : this.sizes[key].name,
                                value   : this.sizes[key].size || this.sizes[key].proportion,
                                image   : '/' + data.image.replace(/^\/+/g, '')
                            });
                        }
                    }).bind(this));
                }

                previews.forEach((function(preview) {
                    var item = this.previewEl.createChild({
                        tag         : 'a',
                        href        : '#',
                        title       : preview.name,
                        cls         : 'x-form-imagecropper-preview-image',
                        'data-key'  : preview.key
                    });

                    if (item) {
                        item.createChild({
                            tag         : 'img',
                            src         : preview.image,
                            alt         : preview.name
                        });

                        item.createChild({
                            tag         : 'span',
                            class       : 'x-form-imagecropper-preview-image-title',
                            html        : preview.name
                        });

                        if (preview.value) {
                            item.createChild({
                                tag         : 'span',
                                class       : 'x-form-imagecropper-preview-image-properties',
                                html        : preview.value
                            });
                        }

                        item.on('click', (function(event) {
                            this.onTrigger2Click(event, item);

                            event.preventDefault();
                        }).bind(this));
                    }
                }).bind(this));
            }
        }
    },
    onDestroy: function(){
        ImageCropper.combo.Browser.superclass.onDestroy.call(this);
    }
});

Ext.reg('imagecropper-combo-browser', ImageCropper.combo.Browser);

ImageCropper.window.CropImage = function(config) {
    config = config || {};

    Ext.applyIf(config, {
        title       : _('imagecropper'),
        cls         : 'x-window-imagecropper',
        minWidth    : 500,
        minHeight   : 300,
        width       : '90%',
        height      : Ext.getBody().getViewSize().height * 0.9,
        layout      : 'border',
        items       : [{
            cls         : 'x-window-imagecropper-previews',
            region      : 'west',
            width       : 300,
            layout      : 'form',
            items       : [{
                xtype       : 'fieldset',
                title       : _('imagecropper.sets'),
                layout      : 'form',
                items       : [{
                    id          : 'imagecropper-state',
                    cls         : 'x-window-imagecropper-state',
                    hidden      : true
                }, {
                    xtype       : 'imagecropper-combo-preview',
                    hideLabel   : true,
                    id          : 'imagecropper-size',
                    name        : 'size',
                    anchor      : '100%',
                    record      : config.record || {},
                    value       : config.cropperSize || '',
                    sizes       : config.cropperSizes || [],
                    listeners   : {
                        'change'     : {
                            fn          : this.onUpdateCropperSize,
                            scope       : this
                        }
                    }
                }, {
                    xtype       : 'toolbar',
                    cls         : 'x-window-imagecropper-toolbar',
                    items       : [{
                        text        : '<i class="icon icon-trash"></i>',
                        handler     : this.onRemoveCropperRecord,
                        scope       : this
                    }, '->', {
                        text        : _('imagecropper.reset'),
                        handler     : this.onResetCropperSize,
                        scope       : this
                    }, {
                        text        : _('imagecropper.save'),
                        cls         : 'primary-button',
                        handler     : this.onUpdateCropperRecord,
                        scope       : this
                    }]
                }]
            }]
        }, {
            cls         : 'x-window-imagecropper-image',
            region      : 'center',
            items       : [{
                autoEl      : {
                    tag         : 'image',
                    src         : Ext.BLANK_IMAGE_URL,
                    id          : 'imagecropper-property-image',
                    width       : '100%',
                    height      : '100%',
                }
            }]
        }, {
            cls         : 'x-window-imagecropper-details',
            region      : 'east',
            width       : 300,
            layout      : 'form',
            items       : [{
                xtype       : 'fieldset',
                title       : _('imagecropper.sets'),
                id          : 'imagecropper-property-canvas',
                layout      : 'form',
                items       : [{
                    xtype       : 'modx-panel',
                    cls         : 'x-form-item',
                    items       : [{
                        xtype       : 'numberfield',
                        id          : 'imagecropper-property-crop-width',
                        name        : 'canvas-height',
                        width       : 100
                    }, {
                        xtype       : 'label',
                        html        : 'x',
                        style       : 'margin: 0 10px;'
                    }, {
                        xtype       : 'numberfield',
                        id          : 'imagecropper-property-crop-height',
                        name        : 'canvas-width',
                        width       : 100
                    }]
                }]
            }, {
                xtype       : 'fieldset',
                title       : _('imagecropper.advanced'),
                layout      : 'form',
                labelSeparator : '',
                labelWidth  : 125,
                items       : [{
                    xtype       : 'numberfield',
                    fieldLabel  : _('imagecropper.property.x'),
                    id          : 'imagecropper-property-canvas-x',
                    name        : 'x',
                    anchor      : '100%'
                }, {
                    xtype       : 'numberfield',
                    fieldLabel  : _('imagecropper.property.y'),
                    id          : 'imagecropper-property-canvas-y',
                    name        : 'y',
                    anchor      : '100%'
                }, {
                    xtype       : 'numberfield',
                    fieldLabel  : _('imagecropper.property.width'),
                    id          : 'imagecropper-property-canvas-width',
                    name        : 'x',
                    anchor      : '100%'
                }, {
                    xtype       : 'numberfield',
                    fieldLabel  : _('imagecropper.property.height'),
                    id          : 'imagecropper-property-canvas-height',
                    name        : 'y',
                    anchor      : '100%'
                }, {
                    xtype       : 'textfield',
                    fieldLabel  : _('imagecropper.property.proportion'),
                    id          : 'imagecropper-property-proportion',
                    name        : 'proportion',
                    anchor      : '100%'
                }]
            }, {
                xtype       : 'fieldset',
                title       : _('imagecropper.options'),
                layout      : 'form',
                labelSeparator : '',
                items       : [{
                    xtype       : 'toolbar',
                    cls         : 'x-window-imagecropper-toolbar',
                    items       : [{
                        text        : '<i class="icon icon-arrows-h"></i>',
                        handler     : this.onFlipHorizontalCropperRecord,
                        scope       : this
                    }, {
                        text        : '<i class="icon icon-arrows-v"></i>',
                        handler     : this.onFlipVerticalCropperRecord,
                        scope       : this
                    }]
                }]
            }]
        }],
        buttons     : [{
            text        : _('cancel'),
            handler     : this.onClose,
            scope       : this,
            action      : 'close'
        }, {
            text        : _('ok'),
            cls         : 'primary-button',
            handler     : this.onClose,
            scope       : this,
            action      : 'select'
        }]
    });

    ImageCropper.window.CropImage.superclass.constructor.call(this, config);

    this.on('afterrender', this.onAfterRender);
    this.on('resize', this.onResizeCropper);
    this.on('destroy', this.onDestroyCropper);
};

Ext.extend(ImageCropper.window.CropImage, MODx.Window, {
    isInitialized: function(ready) {
        if (ready) {
            return this.cropper && this.cropper.ready;
        }

        return this.cropper;
    },
    onAfterRender: function() {
        this.cropperImage               = Ext.get('imagecropper-property-image');
        this.cropperImageSize           = Ext.getCmp('imagecropper-property-canvas');
        this.cropperFieldCropWidth      = Ext.getCmp('imagecropper-property-crop-width');
        this.cropperFieldCropHeight     = Ext.getCmp('imagecropper-property-crop-height');
        this.cropperFieldCanvasWidth    = Ext.getCmp('imagecropper-property-canvas-width');
        this.cropperFieldCanvasHeight   = Ext.getCmp('imagecropper-property-canvas-height');
        this.cropperFieldProportion     = Ext.getCmp('imagecropper-property-proportion');
        this.cropperFieldCanvasX        = Ext.getCmp('imagecropper-property-canvas-x');
        this.cropperFieldCanvasY        = Ext.getCmp('imagecropper-property-canvas-y');
        this.cropperFieldState          = Ext.getCmp('imagecropper-state');

        this.cropperState               = 'ready';
        this.cropperRecord              = this.setCropperRecord();
        this.cropperSizes               = this.getCropperSizes();

        this.cropperSize                = this.getCropperDefaultSize();
        this.cropperSizeData            = this.getCropperSizeData();

        if (this.cropperSizeData) {
            this.cropper = new Cropper(document.getElementById('imagecropper-property-image'), {
                data                        : this.cropperSizeData,
                viewMode                    : 2,
                dragMode                    : 'none',
                zoomable                    : false,
                toggleDragModeOnDblclick    : false,
                autoCropArea                : 1,
                crop                        : (function(event) {
                    this.onUpdateCropperCanvas(event.detail);
                }).bind(this),
                cropstart                   : (function(event) {
                    this.setCropperState('start');
                }).bind(this),
                cropend                     : (function(event) {
                    this.setCropperState('stop');
                }).bind(this),
                ready                       : (function(event) {
                    this.onResetCropperSize();
                }).bind(this),
            });
        }
    },
    onResizeCropper: function() {
        if (this.isInitialized(true)) {
            setTimeout((function () {
                this.cropper.resize();
            }).bind(this), 50);
        }
    },
    onDestroyCropper: function() {
        if (this.isInitialized()) {
            this.cropper.destroy();
        }
    },
    onClose: function(btn) {
        if (this.isInitialized()) {
            if (this.cropperState !== 'saved' && this.cropperState !== 'ready') {
                Ext.MessageBox.confirm(_('imagecropper.changes.title'), _('imagecropper.changes.content'), (function(btn) {
                    if (btn === 'yes') {
                        if (btn.action === 'select') {
                            this.fireEvent('select', {
                                image   : this.cropperRecord.image || '',
                                sizes   : this.cropperSizes || {}
                            });
                        }

                        this.close();
                    }
                }).bind(this));

                return false;
            } else {
                if (btn.action === 'select') {
                    this.fireEvent('select', {
                        image   : this.cropperRecord.image || '',
                        sizes   : this.cropperSizes || {}
                    });
                }

                this.close();
            }
        } else {
            this.close();
        }
    },
    setCropperRecord: function() {
        var record = {
            image   : this.record.image || '',
            sizes   : this.record.sizes || {}
        };

        if (Ext.isEmpty(record.image)) {
            this.cropperImage.dom.src = Ext.BLANK_IMAGE_URL;
        } else {
            this.cropperImage.dom.src = '/' + record.image.replace(/^\/+/g, '');
        }

        return record;
    },
    getCropperSizes: function() {
        Ext.iterate(this.cropperSizes, (function(key, data) {
            if (data['size']) {
                var size    = data['size'].match(/^([0-9]+)x([0-9]+)$/);
                var ratio   = parseInt(size[1]) / parseInt(size[2]);

                if (size) {
                    Ext.apply(data, {
                        key         : key,
                        width       : parseInt(size[1]),
                        height      : parseInt(size[2]),
                        ratio       : ratio,
                        proportion  : Math.ceil(ratio) + 'x' + Math.round(((Math.ceil(ratio) / ratio) * 100) / 100)
                    });

                    if (this.cropperRecord.sizes[key]) {
                        Ext.apply(data, this.cropperRecord.sizes[key]);
                    }

                    this.cropperSizes[key] = data;
                }
            } else if (data['proportion']) {
                var ratio = data['proportion'].match(/^([0-9]+)x([0-9]+)$/);

                if (ratio) {
                    Ext.apply(data, {
                        key     : key,
                        ratio   : parseInt(ratio[1]) / parseInt(ratio[2])
                    });

                    if (this.cropperRecord.sizes[key]) {
                        Ext.apply(data, this.cropperRecord.sizes[key]);
                    }

                    this.cropperSizes[key] = data;
                }
            }
        }).bind(this));

        return this.cropperSizes;
    },
    getCropperDefaultSize: function() {
        if (this.cropperSize === 'default') {
            return Object.keys(this.cropperSizes)[0];
        }

        return this.cropperSize;
    },
    setCropperSizeData: function(data) {
        this.cropperSizes[this.cropperSize] = data;
    },
    getCropperSizeData: function() {
        if (this.cropperSizes[this.cropperSize]) {
            return JSON.parse(JSON.stringify(this.cropperSizes[this.cropperSize]));
        }

        return {};
    },
    getCropperCanvasData: function() {
        var imageData   = this.cropper.getImageData();
        var canvasData  = this.cropper.getData();
        var sizeData    = this.getCropperSizeData();

        return {
            width           : Math.round(sizeData.width || canvasData.width),
            height          : Math.round(sizeData.height || canvasData.height),
            imageWidth      : imageData.naturalWidth,
            imageHeight     : imageData.naturalHeight,
            canvasWidth     : Math.round(canvasData.width),
            canvasHeight    : Math.round(canvasData.height),
            proportion      : sizeData.proportion,
            scaleX          : canvasData.scaleX,
            scaleY          : canvasData.scaleY,
            x               : Math.round(canvasData.x),
            y               : Math.round(canvasData.y)
        };
    },
    setCropperState: function(state, content) {
        if (this.isInitialized()) {
            this.cropperState = state;

            this.cropperFieldState.removeClass('red');
            this.cropperFieldState.removeClass('green');
            this.cropperFieldState.removeClass('loading');

            if (state === 'start' || state === 'stop') {
                this.cropperFieldState.show().addClass('red').update(_('imagecropper.changes_unsaved'));
            } else if (state === 'saved') {
                this.cropperFieldState.show().addClass('green').update(_('imagecropper.changes_saved'));
            } else if (state === 'saving') {
                this.cropperFieldState.show().addClass('loading').update(_('imagecropper.saving'));
            } else if (state === 'failure') {
                this.cropperFieldState.show().addClass('red').update(content);
            } else {
                this.cropperFieldState.hide();
            }

            var sizes = Ext.getCmp('imagecropper-size');

            if (sizes) {
                if (this.cropperState === 'saved' || this.cropperState === 'ready') {
                    sizes.enableAll();
                } else {
                    sizes.disableAll(this.cropperSize);
                }
            }
        }

        return this.cropperState;
    },
    onUpdateCropperCanvas: function(event) {
        if (this.isInitialized()) {
            var data = this.getCropperCanvasData(event);

            if (data) {
                this.cropperImageSize.setTitle(_('imagecropper.property.original', {
                    width   : data.imageWidth,
                    height  : data.imageHeight
                }));

                this.cropperFieldCropWidth.setValue(data.width);
                this.cropperFieldCropHeight.setValue(data.height);

                this.cropperFieldCanvasWidth.setValue(data.canvasWidth);
                this.cropperFieldCanvasHeight.setValue(data.canvasHeight);

                this.cropperFieldProportion.setValue(data.proportion);

                this.cropperFieldCanvasX.setValue(data.x);
                this.cropperFieldCanvasY.setValue(data.y);
            }
        }
    },
    onUpdateCropperImage: function(image) {
        if (this.isInitialized()) {
            var previewImage = Ext.get('imagecropper-preview-' + this.cropperSize);

            if (previewImage) {
                previewImage.dom.src = '/' + this.cropperSizes[this.cropperSize].image.replace(/^\/+/g, '');
            }
        }
    },
    onRemoveCropperRecord: function(tf) {
        Ext.MessageBox.confirm(_('imagecropper.remove.title'), _('imagecropper.remove.content'), (function(btn) {
            if (btn === 'yes') {
                this.fireEvent('select', {});

                this.close();
            }
        }).bind(this));
    },
    onUpdateCropperSize: function(tf) {
        if (this.isInitialized()) {
            if (tf.getValue().value) {
                this.cropperSize = tf.getValue().value;

                this.onResetCropperSize();
            }
        }
    },
    onResetCropperSize: function() {
        if (this.isInitialized()) {
            var data = this.getCropperSizeData();

            if (data) {
                if (data.ratio) {
                    this.cropper.setAspectRatio(data.ratio);
                }

                if (data.image) {
                    data.width  = data.canvasWidth || data.width;
                    data.height = data.canvasHeight || data.height;
                } else {
                    data.width  = NaN;
                    data.height = NaN;
                }

                this.cropper.setData(data);
            }

            this.setCropperState('ready');
        }
    },
    onFlipHorizontalCropperRecord: function(event) {
        var data = this.getCropperCanvasData(event);

        if (data.scaleX === 1) {
            this.cropper.scaleX(-1);
        } else {
            this.cropper.scaleX(1);
        }

        this.setCropperState('start');
    },
    onFlipVerticalCropperRecord: function(event) {
        var data = this.getCropperCanvasData(event);

        if (data.scaleY === 1) {
            this.cropper.scaleY(-1);
        } else {
            this.cropper.scaleY(1);
        }

        this.setCropperState('start');
    },
    onUpdateCropperRecord: function() {
        if (this.isInitialized()) {
            var data = {};

            Ext.apply(data, this.getCropperSizeData());
            Ext.apply(data, this.getCropperCanvasData());

            MODx.Ajax.request({
                url         : ImageCropper.config.connector_url,
                params      : {
                    action          : 'mgr/crop',
                    resource        : this.resource,
                    image           : this.cropperRecord.image,
                    imageWidth      : data.imageWidth,
                    imageHeight     : data.imageHeight,
                    cropWidth       : data.width,
                    cropHeight      : data.height,
                    canvasWidth     : data.canvasWidth,
                    canvasHeight    : data.canvasHeight,
                    scaleX          : data.scaleX,
                    scaleY          : data.scaleY,
                    x               : data.x,
                    y               : data.y
                },
                listeners   : {
                    'success'   : {
                        fn          : function(result) {
                            data.image = result.object.image;

                            this.setCropperSizeData(data);

                            this.onUpdateCropperImage();

                            this.setCropperState('saved');
                        },
                        scope       : this
                    },
                    'failure'   : {
                        fn          : function(result) {
                            this.setCropperState('failure', result.message);
                        },
                        scope       : this
                    }
                }
            });

            this.setCropperState('saving');
        }
    }
});

Ext.reg('imagecropper-window-crop-image', ImageCropper.window.CropImage);

ImageCropper.combo.Preview = function(config) {
    config = config || {};

    var data = [];

    if (!config.sizes[config.value]) {
        config.value = Object.keys(config.sizes)[0];
    }

    Ext.iterate(config.sizes, function(key, size) {
        if ((size.size && size.size.match(/^([0-9]+)x([0-9]+)$/)) || (size.proportion && size.proportion.match(/^([0-9]+)x([0-9]+)$/))) {
            var preview = config.record.image || '';

            if (config.record.sizes && config.record.sizes[key]) {
                if (!Ext.isEmpty(config.record.sizes[key].image)) {
                    preview = config.record.sizes[key].image;
                }
            }

            data.push({
                value       : key,
                boxLabel    : '<img src="/' + preview.replace(/^\/+/g, '') + '" id="imagecropper-preview-' + key + '" alt="' + size.name + '" /><span>' + size.name + '</span>',
                name        : 'size',
                checked     : key === config.value
            });
        }
    });

    config.value = null;

    Ext.applyIf(config, {
        columns     : 1,
        cls         : 'x-form-imagecropper-sets',
        items       : data
    });

    ImageCropper.combo.Preview.superclass.constructor.call(this, config);
};

Ext.extend(ImageCropper.combo.Preview, Ext.form.RadioGroup, {
    enableAll: function() {
        this.eachItem(function(item) {
            item.enable();
        });
    },
    disableAll: function(value) {
        this.eachItem(function(item) {
            if (item.value !== value) {
                item.disable();
            }
        });
    }
});

Ext.reg('imagecropper-combo-preview', ImageCropper.combo.Preview);
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

    Ext.applyIf(config, {
        width           : 400,
        trigger1Action  : 'file',
        trigger1Class   : 'x-form-image-trigger',
        trigger2Action  : 'crop',
        trigger2Class   : 'x-form-crop-trigger',
        source          : config.source || MODx.config.default_media_source
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
        var triggers = this.trigger.select('.x-form-trigger', true);

        triggers.each(function(trigger, all, index) {
            if (index === 0) {
                Ext.DomHelper.insertBefore(trigger, {tag: 'div', cls: 'x-form-trigger ' + (this.trigger1Class || '')});
            } else {
                Ext.DomHelper.insertBefore(trigger, {tag: 'div', cls: 'x-form-trigger ' + (this.trigger2Class || '')});
            }

            trigger.remove();
        }, this);

        ImageCropper.combo.Browser.superclass.initTrigger.call(this);
    },
    onTrigger1Click : function(btn) {
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
            hideSourceCombo     : this.hideSourceCombo || false,
            listeners           : {
                'select'            : {
                    fn                  : function(data) {
                        console.log(data);
                        this.onSelectImage(data.fullRelativeUrl);

                        this.fireEvent('select', data);
                    },
                    scope               : this
                }
            }
        });

        this.browserWindow.show(btn);

        return true;
    },
    onTrigger2Click: function(event, btn) {
        if (Ext.isEmpty(this.getValue())) {
            return false;
        }

        if (this.cropImageWindow) {
            this.cropImageWindow.destroy();
        }

        this.cropImageWindow = MODx.load({
            xtype           : 'imagecropper-window-crop-image',
            closeAction     : 'close',
            cropperDefault  : Ext.get(btn).dom.dataset.key || '',
            cropperSizes    : this.sizes || {},
            record          : Ext.decode(this.getValue()),
            listeners       : {
                'select'        : {
                    fn              : function(data) {
                        this.setValue(data);
                    },
                    scope           : this
                }
            }
        });

        this.cropImageWindow.show(btn);

        return true;
    },
    onSelectImage: function(image) {
        this.setValue({
            image : image
        });

        return this;
    },
    setValue: function(value) {
        var rawValue = this.getObjectRawValue(value);

        this.el.dom.value = Ext.encode(rawValue);

        this.fakeEl.dom.value = rawValue.image;

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
                    for (var key in value.sizes) {
                        if (this.sizes[key]) {
                            previews.push({
                                key     : key,
                                name    : this.sizes[key].name,
                                image   : '/' + value.sizes[key].image.replace(/^\/+/g, '')
                            });
                        }
                    }
                }

                previews.forEach((function(preview) {
                    var item = this.previewEl.createChild({tag: 'a', href: '#', title: preview.name, cls: 'x-form-imagecropper-preview-image'});

                    if (item) {
                        item.createChild({tag: 'img', src: preview.image, alt: preview.name, 'data-key': preview.key});
                        item.createChild({tag: 'span', html: preview.name, 'data-key': preview.key});

                        item.on('click', (function(event, btn) {
                            this.onTrigger2Click(event, btn);

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
                    value       : config.cropperDefault || '',
                    sizes       : config.cropperSizes || [],
                    listeners   : {
                        'change'     : {
                            fn          : this.onUpdateCropperSize,
                            scope       : this
                        },
                        //'change'    : {
                        //    fn          : this.onCheckCropperSize,
                        //    scope       : this
                        //}
                    }
                }, {
                    xtype       : 'toolbar',
                    cls         : 'x-window-imagecropper-toolbar',
                    items       : ['->', {
                        text        : _('imagecropper.reset'),
                        handler     : this.onResetCropper,
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
                cls         : 'x-form-item',
                id          : 'imagecropper-property-canvas'
            }, {
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
            }, {
                xtype       : 'fieldset',
                title       : _('imagecropper.advanced'),
                layout      : 'form',
                labelSeparator : '',
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
        this.cropperRecord  = {
            image               : this.record.image,
            sizes               : this.record.sizes || {}
        };

        this.cropperImage               = Ext.get('imagecropper-property-image');
        this.cropperImageSize           = Ext.getCmp('imagecropper-property-canvas');
        this.cropperFieldCropWidth      = Ext.getCmp('imagecropper-property-crop-width');
        this.cropperFieldCropHeight     = Ext.getCmp('imagecropper-property-crop-height');
        this.cropperFieldCanvasWidth    = Ext.getCmp('imagecropper-property-canvas-width');
        this.cropperFieldCanvasHeight   = Ext.getCmp('imagecropper-property-canvas-height');
        this.cropperFieldCanvasX        = Ext.getCmp('imagecropper-property-canvas-x');
        this.cropperFieldCanvasY        = Ext.getCmp('imagecropper-property-canvas-y');
        this.cropperFieldState          = Ext.getCmp('imagecropper-state');

        if (Ext.isEmpty(this.record.image)) {
            this.cropperImage.dom.src = Ext.BLANK_IMAGE_URL;
        } else {
            this.cropperImage.dom.src = '/' + this.record.image.replace(/^\/+/g, '');
        }

        var data = this.getCropperDefaultSize(this.cropperDefault);

        this.cropperSize    = data.key;
        this.cropperData    = {};
        this.cropperHistory = {};
        this.cropperState   = 'ready';

        data.width          = data.canvasWidth || data.width;
        data.height         = data.canvasHeight || data.height;

        this.cropper = new Cropper(document.getElementById('imagecropper-property-image'), {
            data                        : data,
            aspectRatio                 : data.ratio,
            viewMode                    : 2,
            dragMode                    : 'none',
            zoomable                    : false,
            center                      : true,
            toggleDragModeOnDblclick    : false,
            crop                        : (function(event) {
                this.onUpdateCropperCanvas(event.detail);
            }).bind(this),
            cropend                     : (function(event) {
                this.setCropperState('cropped');
            }).bind(this),
            ready                       : (function(event) {
                this.onUpdateCropperMeta();
                this.onUpdateCropperHistory();
            }).bind(this),
        });
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
            if (this.getCropperState('cropped')) {
                Ext.MessageBox.confirm(_('imagecropper.changes.title'), _('imagecropper.changes.content'), (function(btn) {
                    if (btn === 'yes') {
                        if (btn.action === 'select') {
                            this.fireEvent('select', this.cropperRecord);
                        }

                        this.close();
                    }
                }).bind(this));

                return false;
            } else {
                if (btn.action === 'select') {
                    this.fireEvent('select', this.cropperRecord);
                }

                this.close();
            }
        } else {
            this.close();
        }
    },
    setCropperSize: function(size) {
        if (this.isInitialized()) {
            this.cropperSize = size.key;

            this.cropper.setData(size);
        }
    },
    getCropperSize: function(size) {
        if (this.cropperSizes[size]) {
            this.cropperSizes[size].key = size;

            var data = this.getCropperSizeData(size);

            if (data) {
                this.cropperSizes[size].canvasWidth     = data.canvasWidth;
                this.cropperSizes[size].canvasHeight    = data.canvasHeight;
                this.cropperSizes[size].x               = data.x;
                this.cropperSizes[size].y               = data.y;
            }

            var sizes = this.getCropperSizeFormat(size);

            if (sizes) {
                this.cropperSizes[size].width           = parseInt(sizes[1]);
                this.cropperSizes[size].height          = parseInt(sizes[2]);
                this.cropperSizes[size].ratio           = parseInt(sizes[1]) / parseInt(sizes[2]);
            }

            return this.cropperSizes[size];
        }

        return null;
    },
    getCropperDefaultSize: function(size) {
        if (!Ext.isEmpty(size)) {
            if (this.cropperSizes[size]) {
                return this.getCropperSize(size);
            }
        }

        for (var key in this.cropperSizes) {
            return this.getCropperSize(key);
        }

        return null;
    },
    setCropperSizeData: function(size, data) {
        this.cropperRecord.sizes[size] = data;
    },
    getCropperSizeData: function(size) {
        if (this.cropperRecord.sizes[size]) {
            return this.cropperRecord.sizes[size];
        }

        return null;
    },
    getCropperSizeFormat: function(size) {
        if (this.cropperSizes[size]) {
            return this.cropperSizes[size].size.match(/^([0-9]+)x([0-9]+)$/);
        }

        return null;
    },
    onUpdateCropperSize: function(tf) {
        if (this.isInitialized()) {
            var size = this.getCropperSize(tf.getValue().value);

            if (size) {
                this.setCropperSize(size);

                this.onUpdateCropperMeta();
                this.onUpdateCropperHistory();

                this.setCropperState('ready');
            }
        }
    },
    onCheckCropperSize: function(tf, record) {
        if (this.isInitialized()) {
            if (this.getCropperState('cropped')) {
                Ext.MessageBox.confirm(_('imagecropper.changes.title'), _('imagecropper.changes.content'), function(btn) {
                    if (btn === 'yes') {
                        //tf.setValue(record.data.key).fireEvent('select', tf);
                    }
                });

                return false;
            }
        }
    },
    setCropperState: function(state, content) {
        if (this.isInitialized()) {
            this.cropperState = state;

            this.cropperFieldState.removeClass('green').removeClass('red').removeClass('loading');

            if (state === 'saved') {
                this.cropperFieldState.show().addClass('green').update(_('imagecropper.changes_saved'));
            } else if (state === 'cropped') {
                this.cropperFieldState.show().addClass('red').update(_('imagecropper.changes_unsaved'));
            } else if (state === 'saving') {
                this.cropperFieldState.show().addClass('loading').update(_('imagecropper.saving'));
            } else if (state === 'failure') {
                this.cropperFieldState.show().addClass('red').update(content);
            } else {
                this.cropperFieldState.hide();
            }

            var cropperSize = Ext.getCmp('imagecropper-size');

            if (cropperSize) {
                if (state === 'saved' || state === 'ready') {
                    cropperSize.enableAll();
                } else {
                    cropperSize.disableAll(this.cropperSize);
                }
            }
        }

        return state;
    },
    getCropperState: function(state) {
        if (state) {
            return this.cropperState === state;
        }

        return this.cropperState;
    },
    onUpdateCropperCanvas: function(event) {
        if (this.isInitialized()) {
            var data = this.getCropperData(event);

            if (data) {
                this.cropperFieldCanvasWidth.setValue(data.canvasWidth);
                this.cropperFieldCanvasHeight.setValue(data.canvasHeight);

                this.cropperFieldCanvasX.setValue(data.x);
                this.cropperFieldCanvasY.setValue(data.y);

                this.cropperData = data;
            }
        }
    },
    onUpdateCropperMeta: function() {
        if (this.isInitialized()) {
            var data = this.getCropperSize(this.cropperSize);

            if (data) {
                this.cropperImageSize.update(_('imagecropper.property.original', {
                    width   : this.cropper.getImageData().naturalWidth,
                    height  : this.cropper.getImageData().naturalHeight
                }));

                this.cropperFieldCropWidth.setValue(data.width);
                this.cropperFieldCropHeight.setValue(data.height);
            }
        }
    },
    onUpdateCropperHistory: function() {
        if (this.isInitialized()) {
            if (!this.cropperHistory[this.cropperSize]) {
                this.cropperHistory[this.cropperSize] = this.getCropperData(this.cropper.getData());
            }
        }
    },
    onResetCropper: function() {
        if (this.isInitialized()) {
            if (this.cropperHistory[this.cropperSize]) {
                this.cropper.setData(this.cropperHistory[this.cropperSize]);
            }

            this.setCropperState('ready');
        }
    },
    onUpdateCropperRecord: function() {
        if (this.isInitialized()) {
            var size = this.getCropperSize(this.cropperSize);

            MODx.Ajax.request({
                url         : ImageCropper.config.connector_url,
                params      : {
                    action          : 'mgr/crop',
                    image           : this.record.image,
                    imageWidth      : this.cropperData.imageWidth,
                    imageHeight     : this.cropperData.imageHeight,
                    cropWidth       : size.width,
                    cropHeight      : size.height,
                    canvasWidth     : this.cropperData.canvasWidth,
                    canvasHeight    : this.cropperData.canvasHeight,
                    x               : this.cropperData.x,
                    y               : this.cropperData.y
                },
                listeners   : {
                    'success'   : {
                        fn          : function(result) {
                            var cropperData = this.cropperData;

                            cropperData.width   = result.object.width;
                            cropperData.height  = result.object.height;
                            cropperData.image   = result.object.image;

                            this.setCropperSizeData(this.cropperSize, cropperData);
                            this.setCropperSizePreview(this.cropperSize, cropperData.image);

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
    },
    getCropperData: function(event) {
        return {
            imageWidth      : this.cropper.getImageData().naturalWidth,
            imageHeight     : this.cropper.getImageData().naturalHeight,
            canvasWidth     : Math.round(event.width),
            canvasHeight    : Math.round(event.height),
            x               : Math.round(event.x),
            y               : Math.round(event.y)
        };
    },
    setCropperSizePreview: function(size, image) {
        var preview = Ext.get('imagecropper-preview-' + size);

        if (preview) {
            preview.dom.src = '/' + image.replace(/^\/+/g, '');
        }
    }
});

Ext.reg('imagecropper-window-crop-image', ImageCropper.window.CropImage);

ImageCropper.combo.Size = function(config) {
    config = config || {};

    var data = [];

    if (!config.sizes[config.value]) {
        config.value = Object.keys(config.sizes)[0];
    }

    for (var key in config.sizes) {
        var size = config.sizes[key];

        if (size.size.match(/^([0-9]+)x([0-9]+)$/)) {
            data.push([key, size.size, size.name]);
        }
    }

    Ext.applyIf(config, {
        store       : new Ext.data.ArrayStore({
            mode        : 'local',
            fields      : ['key', 'size', 'label'],
            data        : data
        }),
        hiddenName  : 'size',
        valueField  : 'key',
        displayField : 'label',
        mode        : 'local',
        tpl         : new Ext.XTemplate('<tpl for=".">' +
            '<div class="x-combo-list-item">' +
                '{label:htmlEncode} <span style="font-style: italic;">({size:htmlEncode})</span>' +
            '</div>' +
        '</tpl>')
    });

    ImageCropper.combo.Size.superclass.constructor.call(this, config);
};

Ext.extend(ImageCropper.combo.Size, MODx.combo.ComboBox);

Ext.reg('imagecropper-combo-size', ImageCropper.combo.Size);

ImageCropper.combo.Preview = function(config) {
    config = config || {};

    var data = [];

    if (!config.sizes[config.value]) {
        config.value = Object.keys(config.sizes)[0];
    }

    for (var key in config.sizes) {
        var size = config.sizes[key];

        if (size.size.match(/^([0-9]+)x([0-9]+)$/)) {
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
    }

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
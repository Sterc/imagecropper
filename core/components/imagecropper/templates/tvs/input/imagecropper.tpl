<textarea id="tv{$tv->id}" name="tv{$tv->id}" rows="15">{$tv->value}</textarea>

<script type="text/javascript">
    // <![CDATA[
    {literal}
        Ext.onReady(function() {
            var panel = Ext.getCmp('modx-panel-resource');

            MODx.ImageCropper = [];
            MODx.ImageCropper.source = {/literal}{json_encode(array_merge($source->toArray(), ['baseUrl' => $baseUrl]))}{literal}

            if (panel) {
                var fld = MODx.load({
                    xtype       : 'imagecropper-combo-browser',
                    source      : {/literal}{$source->id}{literal},
                    sizes       : Ext.decode('{/literal}{$sizes}{literal}'),
                    previews    : {/literal}{$previews}{literal},
                    applyTo     : 'tv{/literal}{$tv->id}{literal}'
                });

                panel.getForm().add(fld);
            }
        });
    {/literal}
    // ]]>
</script>
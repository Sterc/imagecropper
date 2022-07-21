<div id="imagecropper-{$tv}-properties-div"></div>

<script type="text/javascript">
    // <![CDATA[
    {literal}
        var params = {
            {/literal}{foreach from=$params key=k item=v name='p'}
                '{$k}': '{$v|escape:"javascript"}'{if NOT $smarty.foreach.p.last},{/if}
            {/foreach}{literal}
        };

        MODx.load({
            xtype       : 'panel',
            layout      : 'form',
            cls         : 'form-with-labels',
            labelAlign  : 'top',
            labelSeparator : '',
            items       : [{
                xtype       : 'textfield',
                fieldLabel  : '{/literal}{$imagecropper.option_sets}{literal}',
                description : MODx.expandHelp ? '' : '{/literal}{$imagecropper.option_sets_desc}{literal}',
                name        : 'inopt_sizes',
                anchor      : '100%',
                allowBlank  : false,
                value       : params['sizes'] || '{"desktop": {"name": "Desktop", "size": "1000x500"}, "mobile": {"name": "Mobiel", "size": "768x500"}}'
            }, {
                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                html        : '{/literal}{$imagecropper.option_sets_desc}{literal}',
                cls         : 'desc-under'
            }, {
                xtype       : 'modx-combo-boolean',
                fieldLabel  : '{/literal}{$imagecropper.option_previews}{literal}',
                description : MODx.expandHelp ? '' : '{/literal}{$imagecropper.option_previews_desc}{literal}',
                hiddenName  : 'inopt_previews',
                anchor      : '100%',
                allowBlank  : false,
                value       : params['previews'] || 1
            }, {
                xtype       : MODx.expandHelp ? 'label' : 'hidden',
                html        : '{/literal}{$imagecropper.option_previews_desc}{literal}',
                cls         : 'desc-under'
            }],
            renderTo    : 'imagecropper-{/literal}{$tv}{literal}-properties-div'
        });
        {/literal}
    // ]]>
</script>
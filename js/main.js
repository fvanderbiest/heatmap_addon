Ext.namespace("GEOR.Addons");

GEOR.Addons.Heatmap = Ext.extend(GEOR.Addons.Base, {

	win : null,
	// the list of available layers
	layerStore : null,
	// the selected layer name
	layerName_HM : null,

	/** Initialize the addon */
	init : function(record) {
		var lang = OpenLayers.Lang.getCode();
		mapProjection = this.map.getProjection();
		if (this.target) {
			this.components = this.target.insertButton(this.position, {
				xtype : 'button',
				enableToggle : true,
				tooltip : this.getTooltip(record),
				iconCls : 'addon-heatmap',
				listeners : {
					"toggle" : this.showWindow,
					scope : this
				}
			});
			this.target.doLayout();
		} else {
			this.item = new Ext.menu.Item({
				id : 'addon-heatmap',
				text : this.getText(record),
				qtip : this.getQtip(record),
				listeners : {
					'click' : this.showWindow,
					scope : this
				}
			});
		}

	},


	/** window to fill the layers characteristics */
	showWindow : function() {

		if (!this.win) {

			serverStore_HM = GEOR.WPS_Utils.initServerStore();
			serverStore_HM.load();

			this.combo_Server_HM = GEOR.WPS_Utils.initCombobox(
					'combo_server_HM', serverStore, OpenLayers
							.i18n("heatmap.workspace"), 'url', 'name', false);
			this.combo_Server_HM.on('select', function(combo, record) {
				GEOR.WPS_Utils.loadNextDataStore(Ext.getCmp('combo_Server_HM'),
						record.get('url'), Ext.getCmp('combo_layer_HM'));
				Ext.getCmp('combo_layer_HM').setDisabled(false);
			});
			this.combo_Layers_HM = GEOR.WPS_Utils.initCombobox(
					'combo_layer_HM', this.layerStore, OpenLayers
							.i18n("heatmap.layername"), 'layer', 'name', true);

			this.combo_Layers_HM.on('select', function(combo, record) {
				layerName_HM = GEOR.WPS_Utils.getWorkspace(combo, Ext
						.getCmp('combo_server_HM'))
						+ ":" + GEOR.WPS_Utils.getLayerName(combo);

			});

			this.win = new Ext.Window({
				title : "Configuration",
				height : 150,
				width : 350,
				bodyStyle : 'padding: 5px',
				layout : 'form',
				labelWidth : 110,
				resizable : true,
				defaultType : 'field',
				items : [ this.combo_Server_HM, this.combo_Layers_HM, {
					fieldLabel : OpenLayers.i18n("heatmap.weightAttr"),
					width : 200,
					id : 'weightAttr_HM',
					allowBlank : false
				} ],
				fbar : [
						'->',
						{
							text : OpenLayers.i18n("heatmap.submit"),
							id : 'submit_HM',
							formBind : true,
							handler : function() {
								// get inserted value for the first layer
								weightAttr_HM = Ext.getCmp('weightAttr_HM')
										.getValue();

								if (layerName_HM == "") {
									Ext.Msg.alert('Warning', OpenLayers
											.i18n("heatmap.warning.message"));
									return;
								}

								this.win.hide();
								this.executeWMS();
							},

							scope : this
						} ],
				listeners : {
					"hide" : function() {
						// this.map.removeLayer(this.layer);
						// this.item && this.item.setChecked(false);
						// this.components && this.components.toggle(false);
						// alert("we are here");
					},
					scope : this
				}
			});

		}

		this.win.show();

	},

	/** Execute the WMS request to get the layer with HeatMAP sld */
	executeWMS : function() {

		newWmsLayer = new OpenLayers.Layer.WMS("Heatmap",
				GEOR.config.GEOSERVER_WMS_URL, {
					layers : layerName_HM,
					transparent : 'true',
					styles : 'Heatmap',
					env : 'weightAttr:' + weightAttr_HM
				}, {
					isBaseLayer : true,
					format : 'image/png',
					singleTile : true
				});
		this.map.addLayers([ newWmsLayer ]);

	},

	destroy : function() {
		GEOR.Addons.Base.prototype.destroy.call(this);
	}
});

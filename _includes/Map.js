views.Map = Backbone.View.extend({
	initialize: function(){
		this.render();
	},
	render: function(){
		// reset
		if (this.layer){this.layer.clearLayers()};
		$('#table').empty();

		this.map = this.map || L.mapbox.map(this.el,'nate.h8gf883c',{
			minZoom:2,
			maxZoom:7,
			center: [10,3],
			zoom:2,
		});

		app.refreshFacets();

		if (app.country && _.contains(app.facetCategories,'country')){
			this.layer = new L.MarkerClusterGroup({showCoverageOnHover:false});
			this.types();
		} else {
			this.layer = new L.LayerGroup();
			this.centroids();
		}

		return this
	},
	centroids: function(){
		var view = this;
		var centroids = new collections.Centroid();

		centroids.url =	'{{site.baseurl}}/api/country-index.json';
		centroids.fetch({
			success: function(){
				centroids.populateCentroid();
				view.circles(centroids);
			}
		})
	},
	types:function(){
		var view = this;
		var types = new collections.Standard();

		types.url = '{{site.baseurl}}/api/type-index.json';
		types.fetch({
			success:function(t){
				typePairs = t.map(function(m){
					return {
						"type": m.get('type'),
						"full": m.get('descr') + '_' + m.get('zoom')
					}
				});
				view.clusters(typePairs);
			}
		})
	},
	scale: function(num){ //scale is approximate, might misinterpret on some numbers
		if (num > 450) {
			return num/15
		} else if (num > 100 && num <=450){
			return num/5
		} else if (num > 50 && num <= 100){
			return num/4
		} else if (num > 10 && num <= 50){
			return num/3
		} else if (num > 5 && num <= 10){
			return num *1
		} else if (num > 0 && num <=5){
			return num * 1.2
		} else {
			return num
		}
	},
	circles: function(centroids){
		var view = this;

		var activityInCountry,
			activityTotal,
			locationTotal,
			circleFeatures,
			circleFeatureCollection;

		var defaultCircle = {
				color:"#ADC4D9",
				weight:1.5,
				opacity:1,
				fillColor: "#34597C",
				fillOpacity: 0.5
			};
		var highlightCircle = {
				color:"#fff",
				weight: 1.5,
				opacity: 0.8,
				fillColor: "#f2f2f2",
				fillOpacity: 0.8
			};
		centroids.each(function(model){ // centroids collection are passed from this.centroids()
			activityInCountry = app.collection
			 	.filter(function(m){return m.get('country')===model.get('country')}); //intersect app.collection and country centroids

			activityTotal = activityInCountry.length;

			// calculate the total locations
			if (activityTotal > 0){
				locationTotal = activityInCountry
				 .map(function(m){return m.get('location')})
				 .reduce(function(memo,num){return memo + num}); // see http://underscorejs.org/#reduce	for sum
			} else {
				locationTotal = 0
			}
			// add the number to the geojson of the centroid model
			model.feature.properties.activityTotal = activityTotal;
			model.feature.properties.locationTotal = locationTotal;

			model.feature.properties.popup = _.template($('#template-circlepopup').html(), {
				countryFullName: model.feature.properties["country-full"],
				actTotal: model.feature.properties.activityTotal,
				locTotal: model.feature.properties.locationTotal,
			});
		})

		circleFeatures = centroids.map(function(model){return model.feature});

		circleFeatureCollection = L.geoJson(circleFeatures,{
    		pointToLayer:function(feature,latlng){
            	return L.circleMarker(latlng,defaultCircle)
            			.setRadius(view.scale(feature.properties.activityTotal));
    		},
    		onEachFeature:function(feature,layer){
				var brief = L.popup({
				    closeButton:false
				}).setContent(feature.properties.popup);
				layer.on('mouseover',function(e){
				    brief.setLatLng(this.getLatLng());
				    view.map.openPopup(brief);
				    e.target.setStyle(highlightCircle);
				}).on('mouseout',function(e){
					view.map.closePopup(brief);
					e.target.setStyle(defaultCircle);
				}).on('click',function(e){
					view.map.closePopup(brief);
					app.facets.push('country-' + feature.properties.country);
					app.facetView.setFacet();
				})
			}
		});

		view.layer.addLayer(circleFeatureCollection);
		view.map.addLayer(view.layer).setView([10,3],2);
	},
	clusters: function(typePairs){
		var view = this;
		var markers = app.collection,
			allLocations,
			markerFeatureCollection,
			locationTypes,
			locationNum,
			tableVaribles,
			tableTemplate;

		var color = [
			{"reporting":"United Nations Office for Project Services","marker-color":"#ADC4D9"},
			{"reporting":"United Nations Development Programme","marker-color":"#34597C"},
			{"reporting":"World Food Programme","marker-color":"#6BB7FF"},
			{"reporting":"United Nations Population Fund","marker-color":"#5C6E7F"},
			{"reporting":"UN Habitat","marker-color":"#5692CC"}
		];

		// populate geojson objects with location and other attributes (two locations might have the same attributes)
		markers.each(function(model){
			// reset multifeature to avoid duplications
			model.multiFeatures = [];

			var locs = model.get('locations');
			_.each(locs,function(loc){
				model.feature.geometry.coordinates = utils.floatCoord(loc['coordinates']); // lon lat is reversed for country jsons?
				model.feature.properties.locType = loc['location-type'];

				model.feature.properties.title = model.get('title');
				model.feature.properties.locTotal = model.get('location');
				model.feature.properties.implementer = model.get('implementer');
				model.feature.properties.sector = model.get('sector');
				model.feature.properties.reporting = model.get('reporting');

				// marker style
				var selectedColor = _.findWhere(color,{reporting: model.get('reporting')});
				model.feature.properties['marker-size'] = 'small';
				model.feature.properties['marker-color'] = selectedColor['marker-color'];

				model.multiFeatures.push(model.feature);
			})
		});

		allLocations = markers.chain()
			.map(function(m){return m.multiFeatures})
			.flatten()
			.map(function(feature){
				var matching = _.findWhere(typePairs,{type:feature.properties.locType}),// use typePairs passed in
				full = matching.full.split('_')[0];

				feature.properties.popup = _.template($('#template-clusterpopup').html(), {
					title: feature.properties.title,
					locType: feature.properties.locType,
					locTypeFull: full,
					locTotal: feature.properties.locTotal,
					reporting: feature.properties.reporting,
					color: feature.properties['marker-color'],
					implementer: feature.properties.implementer,
					sector: feature.properties.sector
				});

				return feature
			})
			.value();

		// make ALL locations into geojson items
		markerFeatureCollection = L.geoJson(allLocations, {
			pointToLayer: L.mapbox.marker.style,
			onEachFeature:function(feature,layer){
				var brief = L.popup({
				    closeButton:false,
					offset: new L.Point(0,-20)
				}).setContent(feature.properties.popup);
				layer.on('mouseover',function(){
				    brief.setLatLng(this.getLatLng());
				    view.map.openPopup(brief);
				}).on('mouseout',function(){
					view.map.closePopup(brief);
				})
			}
		});

		this.layer.addLayer(markerFeatureCollection);
		this.map.fitBounds(this.layer.getBounds()) // zoom map to the cluster layer bounds
				.addLayer(this.layer);

		locationTypes = markers.map(function(m){
			return _.chain(m.get('locations'))
					.map(function(o){return o['location-type']})
					.uniq()
					.flatten()
					.value()
		});

		locationNum = markers.chain()
			.map(function(m){return m.get('locations')})
			.flatten()
			.value()
			.length;

		// generate table and table headlines
		tableVaribles = {
			locationNum: locationNum,
			title: markers.map(function(m){return m.get("title")}),
			contact: markers.map(function(m){return m.get("contact")}),
			budget: markers.map(function(m){return m.get("budget")}),
			expenditure: markers.map(function(m){return m.get("expenditure")}),
			sector: markers.map(function(m){return m.get('sector')}),
			reporting: markers.map(function(m){return m.get('reporting')}),
			implementer: markers.map(function(m){return m.get('implementer')}),
			reporting: markers.map(function(m){return m.get('reporting')}),
			type: locationTypes
		};

		tableTemplate = _.template($('#template-table').html(), tableVaribles);
		$('#table').html(tableTemplate);

		// re-run foundation for tooltips
		$(document).foundation();
		// make table sortable
		new Tablesort(document.getElementById('activity-table'));
	},

});
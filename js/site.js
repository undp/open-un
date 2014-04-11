---
---
var utils = {},
	models = {},
	collections = {},
	views = {},
	router = {};
// --------- Utils ---------
utils.floatCoord = function(coord){
	return _.chain(coord)
			.map(function(m){return parseFloat(m)})
			.value();
};
utils.getCategory = function(string){
	return string.split('-')[0]
};
utils.getValue = function(string){
	return string.split('-')[1]
};
utils.unique = function(array){
	return _.chain(array)
			.flatten()
			.uniq()
			.value()
};
// --------- Models ---------
models.Standard = Backbone.Model.extend({
	initialize:function(){
		this.feature = {
				"type":"Feature",
				"properties":{},
				"geometry":{
					"type":"Point",
					"coordinates":[]
				}
			};
		this.multiFeatures = [];
	}
});
// --------- Collections ---------
collections.Standard = Backbone.Collection.extend({
	model: models.Standard,
	select: function(key, val){
		selected = this.filter(function(model){
			if (key === 'sector'){ // treat sector differently from other facets since it is an array
				if (_.contains(model.get("sector"),val)){return model}
			} else {
				return model.get(key) === val
			}
		});
		return new collections.Standard(selected)
	}
});
collections.Centroid = Backbone.Collection.extend({
	model: models.Standard,
	populateCentroid: function(){
		populated = this.each(function(model){
			var coord = utils.floatCoord(model.get('country-coord')),
				country = model.get('country'),
				full = model.get('country-full');

			model.feature.geometry.coordinates = coord;
			model.feature.properties["country"] = country;
			model.feature.properties["country-full"] = full;
		});
		return new collections.Centroid(populated)
	}
});
// --------- Views ---------
{% include Facet.js %}
{% include Map.js %}
// --------- Router ---------
router.App = Backbone.Router.extend({
	routes: {
		"" : "app",
		":facet" : "facet"
	},
	globalSetup: function(){
		app.global = new collections.Standard();
		app.global.url = '{{site.baseurl}}/api/global.json';
		app.collection = app.global;
	},
	countrySetup: function(ctry){
		app.country = new collections.Standard();
		app.country.url = '{{site.baseurl}}/api/countries/' + ctry.toLowerCase() + '.json';
		app.collection = app.country;
	},
	refreshFacets: function(){
		app.facetCategories = _.chain(app.facets)
			.map(function(f){return utils.getCategory(f)})
			.value(),
		app.facetValues = _.chain(app.facets)
			.map(function(f){return utils.getValue(f)})
			.value();
	},
	facet: function(){
		var countryIndex,
			countryName;

		app.facets = Backbone.history.fragment.split('|');
		app.refreshFacets();

		countryIndex = _.indexOf(app.facetCategories,"country");

		if (countryIndex === -1){
			app.globalSetup();
		} else if (countryIndex >-1){
			countryName = app.facetValues[countryIndex];
			app.countrySetup(countryName);
		}

		// always go back to the whole global or country collection
		// since app.faceted will go through all the facets selected
		app.collection.fetch({
			success:function(){
				app.collection = app.facetedCollection(app.facetCategories,app.facetValues);
				app.app();
			}
		})

		$('.intro').removeClass('fadeInUp').addClass('fadeOutDown');
	},
	facetedCollection: function(cat,val){
		var currentCollection,
			exact;
		currentCollection = app.collection;
		exact = _.chain(val)	// give back the space in the value for exact matching
			.map(function(v){
				if (_.contains(v,'_')) {
					return v.replace(/_/g,' ')
				} else {
					return v
				}
			})
			.value();

		_.each(cat,function(facet,i){
			currentCollection = currentCollection.select(facet,exact[i]);
		})

		return currentCollection
	},
	init: function(){
		$('#facets').empty();
		app.facetView = new views.Facet({
			el:$('#facets')
		});
		if (app.map) {
			app.map.render()
		} else {
			app.map = new views.Map({
				el:$('#map')
			})
		}
	},
	app: function(){
		// fetch global collection if the app was accessed
		// for the first time or there is no facet selected
		if (!app.global && !app.country || app.facets.length * Backbone.history.fragment.length === 0){
			app.facets = [];
			app.globalSetup();
			app.collection.fetch({
				success: function(){
					app.init();
				}
			});
		} else { // else there is a currentCollection in place
			app.facets = app.facets;
			app.init();
		}
	}
});
// --------- Start ---------
$(function() {
    app = new router.App();
    Backbone.history.start();
    $('#txt_search_filters').keyup(function(){
		var keyword = $(this).val().toLowerCase();

		$('.facet').each(function(){
		    $(this).find('.facet-item').hide();

		    var matched = false;
		    $(this).find('.facet-item a').each(function(){
			if($(this).text().toLowerCase().indexOf(keyword.toString().toLowerCase())>=0){
			    matched = true;
			    $(this).closest('.facet-item').show();
			}
		    });

		    if(matched){
			$(this).show();
		    }else{
			$(this).hide();
		    }

		    if(keyword == ""){
			$('.facet').show();
		    }

		});
    });
});




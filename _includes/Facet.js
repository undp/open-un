views.Facet = Backbone.View.extend({
	events:{
		'click .facet-item a': 'setFacet',
		'click #download': 'download'
	},
	initialize: function(){
		this.render();
	},
	render: function(){
		var view = this;

		var template,
			templateVaribles,
			fullNames,
			countries = [],
			sectors = [],
			reporting = [],
			implementers = [],
			namePairs;

		app.collection.each(function(model){ // non-faceted collections remain collections
			countries.push(model.get('country'));
			sectors.push(model.get('sector'));
			reporting.push(model.get('reporting'));
		});

		countries = utils.unique(countries).sort();
		sectors = utils.unique(sectors).sort();
		reporting = utils.unique(reporting).sort();

		// map full country full names to short country names
		fullNames = new collections.Standard();
		fullNames.url = '{{site.baseurl}}/api/country-index.json';
		fullNames.fetch({
			success:function(names){
				namePairs = names.map(function(m){
					return {
						"shrt": m.get('country'),
						"full": m.get('country-full') + '_' + m.get('country') 
					}
				});
				setTemplate();
			}
		})

		function setTemplate(){
			var allMatches = [],
				fullCountries;

			_.each(countries,function(ctry){
				var matching = _.where(namePairs,{shrt:ctry});
				allMatches.push(matching);
			});

			fullCountries = _.chain(allMatches)
				.flatten()
				.value()
				.map(function(o){return o.full})
				.sort();

	    	templateVaribles = {
				facets:[
					{"cat":"country","text":"Country Unit","items":fullCountries},
					{"cat":"sector","text":"Sector","items":sectors},
					{"cat":"reporting","text":"Reporting Organization","items":reporting}
				]
			};

			template = _.template($('#template-facet').html(), templateVaribles);
			view.$el.html(template);

			_.each(app.facets,function(f){
				$('.facet-item').find('#'+f).parent().addClass('active');
				$('.facet-item').find('#'+f).parent().siblings().addClass('inactive');
			})

			if (app.facets.length > 0){
				$('#download').show().attr('download', app.facets.join('%') + '.json');
			} else {
				$('#download').hide();
			}
		}

		return view
    },
	setFacet: function(e){
		if (e != undefined){// e is undefined when a circle marker is clicked
			e.preventDefault();
			e.stopPropagation();
			app.facets.push(e.target.id);
		}

		var recent,
			recentCount = 0,
			facetUrl;

		recent = _.chain(app.facets)
			  .last()
			  .value();

		_.chain(app.facets)
		 .filter(function(existing){
	 		// if the facet category is already selected, replace the old value with the newest value under that facet
			if (utils.getCategory(existing) === utils.getCategory(recent) && utils.getValue(existing) != utils.getValue(recent)){
				app.facets = _.without(app.facets,existing);
			} else if (existing === recent) {
				recentCount += 1;
				if (recentCount > 1){
					app.facets = _.without(app.facets,recent);
					recentCount = 0;
				} else {
					app.facets = _.uniq(app.facets);
				}
			}
		})

		facetUrl = _.chain(app.facets)
						.value()
						.join('|');

		app.navigate(facetUrl,{trigger:true});

		// keep the event from firing multiple times
		this.undelegateEvents();
	},
	download: function(e){
		var finalCollection = app.collection.toJSON();
		var download = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finalCollection));

		$(e.target).attr('href','data:'+ download);
	}
});

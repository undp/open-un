## OpenUN

OpenUN is a project instigated by UNDP (United Nations Development Programme) and built by Development Seed, with the intent to bring together and better visualize the worldwide activities amongst UN branches. 

This prototype utilizes published datasets from [IATI](http://www.iatiregistry.org/about-2), the International Aid Transparency Initiative. At the core of aid transparency, _is knowing the details of who is doing what, where. IATI is a multi-stakeholder effort to make this information available._

While publishing data to an open standard is the first big step towards coordinating aid efficiency, making that information accessible is equally crucial. True transparency is not guaranteed by the bulk release of data alone, but comes through the accessibility, discoverability, and interoperability of the data delivery. Learning from the experience of [open.undp.org](http://open.undp.org), UNDP and Development Seed collaborated on building a prototype of Open-UN that puts IATI datasets to good use.

The prototype enables the user to filter the activities by country units, [sectors](http://iatistandard.org/activities-standard/sector/) and reporting organizations

### Data

Currently, OpenUN culls data from two UN organizations that publish aid activities with recorded locations - UNDP and UNOPS. As more and more organizations improve on their data quality and start to publish granular activity locations, the site can grow to accommodate more datasets.

### Site Specs

IATI activities are downloaded as xml files, processed via [python scripts](link to _bin) into json, and consumed as static APIs on open.un.org. There are [significant advantages](http://developmentseed.org/blog/2013/10/24/transforming-iati-data/) to using json and a static API in the IATI context: faster site speed and more consistent data quality. Currently there're two APIs:

- `../api/global.json`: activities from all organizations globally
- `../api/countries/{country-code}.json`: activities from all organizations in a specific country, with more extensive information about an activity such budget and expenditures
- `../api/country-index.json`: index for full country names and their coordinates
- `../api/type-index.json`: index for location types 

The site runs as a client-side app with [BackBone.js](http://backbonejs.org/) and [Foundation.js](http://foundation.zurb.com/). Maps are built with [mapbox.js](https://www.mapbox.com/mapbox.js/) and [leaflet.js](http://leafletjs.com/). Hosted here on GitHub, Open-UN uses [jekyll](https://github.com/jekyll/jekyll) as the static site generator.

### Open for improvement

By becoming an open source project, OpenUN welcomes all improvement pull requests and suggestions via [the issue queue](https://github.com/undp/open-un/issues). The current prototype can be improved in multiple ways:

- Better ways to display location data:

Since all locations are recorded with a certain precision level (eg. ADM1, PPL) according to the [IATI location criteria](http://iatistandard.org/codelists/location_type/), the visual proximity of plotted activities are not indicative of the physical one. For more effective visualizations, ways to differentiate the two kinds of proximities need to be devised.

- Automated xml-to-json process:

The current site requires periodical mannual updates when new datasets are added to IATI by the reporting organizations. Suggestions to incorporate the IATI api for automated data updates are welcome.

- Scalable data download methods:

The current dataset is downloaded as jsons stored directly in the DOM, which might be slow with a potential growing dataset.

### Further Readings

- IATI data standard (aka. what the xml fields represent): http://iatistandard.org/activities-standard/
- Documentation for open.undp.org (including an outline of jekyll setup): https://github.com/undp/undp.github.com/blob/master/README.md

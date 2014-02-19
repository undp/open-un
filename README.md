## OpenUN

OpenUN is a project instigated by UNDP (United Nations Development Programme), and built by [Development Seed](http://developmentseed.org/), with the intent to bring together and better visualize the worldwide activities amongst UN branches. 

The OpenUN prototype utilizes published datasets from [IATI](http://www.iatiregistry.org/about-2), the International Aid Transparency Initiative. "At the core of aid transparency," as it is stated on the IATI site, "is knowing the details of who is doing what, where. IATI is a multi-stakeholder effort to make this information available."

While publishing data to an open standard is the first big step towards coordinating aid efficiency, making that information accessible is equally crucial. True transparency is not guaranteed by the bulk release of data alone, but comes through the accessibility, discoverability, and interoperability of the data delivery. Learning from the experience of [open.undp.org](http://open.undp.org), UNDP and Development Seed collaborated on building a prototype of Open-UN that puts IATI datasets to good use.

### Prototype Specs

#### Data

Currently, OpenUN culls data from two UN organizations that publish aid activities with recorded locations - UNDP and UNOPS. As more and more organizations improve on their data quality and start to publish granular activity locations, the map would become more nuanced.

Data, scripts and process can be found in the [`_bin`](https://github.com/undp/open-un/tree/gh-pages/_bin) folder.

#### Static APIs

IATI activities are downloaded as xml files, processed via [python scripts](https://github.com/undp/open-un/tree/gh-pages/_bin) into json, and consumed as static APIs on open.un.org. [The json structure](https://gist.github.com/jueyang/45db66a392db0bb11a34) reflects what is important in visualizing an activity on the map, namely - the location(s), reporting organization, sector(s), and implementing organization(s).

There are [significant advantages](http://developmentseed.org/blog/2013/10/24/transforming-iati-data/) of using json and a static API: faster site speed and more consistent data quality.

Processed APIs and related look-up indices can be found in the [`api`](https://github.com/undp/open-un/tree/gh-pages/api) folder.

#### Frameworks

The site runs as a client-side app with [BackBone.js](http://backbonejs.org/) and [Foundation.js](http://foundation.zurb.com/). Maps are built with [MapBox.js](https://www.mapbox.com/mapbox.js/) and [leaflet.js](http://leafletjs.com/). Hosted here on GitHub, OpenUN uses [jekyll](https://github.com/jekyll/jekyll) as the static site generator.

### How to Contribute

#### Articulate Your Needs

For non-developers who want to improve the site, it would be very helpful for you articulate your needs that pertain to using this prototype. To get the conversation going, you can strat an issue in the [GitHub issue queue](https://github.com/undp/open-un/issues). The discussion will be visible to the public.

#### Send Pull Request

For those who would like to improve the prototype itself code- and organization-wise, comments and pull requests are welcome. Here are a few potential problems to start with:

- Better ways to display location data:

Since all locations are recorded with a certain precision level (eg. ADM1, PPL) according to the [IATI location criteria](http://iatistandard.org/codelists/location_type/), the visual proximity of plotted activities are not indicative of the physical one. For more effective visualizations, ways to differentiate the two kinds of proximities need to be devised.

- Automated xml-to-json process:

The current site requires periodical mannual updates when new datasets are added to IATI by the reporting organizations. Suggestions to incorporate the IATI api for automated data updates are welcome.

- Scalable data download methods:

The current dataset is downloaded as jsons stored [directly in the DOM](https://github.com/undp/open-un/blob/gh-pages/_includes/Facet.js#L127), which serves as a proof of concept but will be slow with a potentially growing dataset. The problem can be framed as a better way to parse static API and have them downloadable.

### Further Readings

For a more in-depth look on the IATI data standard:

- IATI data standard (aka. what the xml fields represent): http://iatistandard.org/activities-standard/

To learn about the jekyll setup:

- Documentation for open.undp.org (including an outline of jekyll setup): https://github.com/undp/undp.github.com/blob/master/README.md
## How to Contribute

### § Articulate Your Needs

For non-developers who want to improve the site, it would be very helpful for you articulate your needs that pertain to using this prototype. To get the conversation going, you can start an issue in the [GitHub issue queue](https://github.com/undp/open-un/issues). The discussion will be visible to the public.

### § Send Pull Request

For those who would like to improve the prototype itself code- and organization-wise, comments and pull requests are welcome. Here are a few potential problems to start with:

- **Better ways to display location data:**

Since all locations are recorded with a certain precision level (eg. ADM1, PPL) according to the [IATI location criteria](http://iatistandard.org/codelists/location_type/), the visual proximity of plotted activities are not indicative of the physical one. For more effective visualizations, ways to differentiate the two kinds of proximities need to be devised.

- **Automated xml-to-json process:**

The current site requires periodical mannual updates when new datasets are added to IATI by the reporting organizations. Suggestions to incorporate the IATI api for automated data updates are welcome.

- **Scalable data download methods:**

The current dataset is downloaded as jsons stored [directly in the DOM](https://github.com/undp/open-un/blob/gh-pages/_includes/Facet.js#L127), which serves as a proof of concept but will be slow with a potentially growing dataset. The problem can be framed as a better way to parse static API and have them downloadable.

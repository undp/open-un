Currently there're two APIs:

- `../api/global.json`: activities from all organizations globally
- `../api/countries/{country-code}.json`: activities from all organizations in a specific country, with more extensive information about an activity such budget and expenditures

The API is devised into `global` and `country` to optimize the speed. The `country` level json will be fetched only when a country is selected.

Along with the API there're a few look-up index:

- `../api/country-index.json`: index for full country names and their coordinates
- `../api/type-index.json`: index for location types 
### APIs

The API is devised into `global` and `country` to optimize the speed. The `country` level json will be fetched only when a country is selected.


- `../api/global.json`: activities from all organizations globally
- `../api/countries/{country-code}.json`: activities from all organizations in a specific country, with more extensive information about an activity such budget and expenditures

### Look-up indices

- `../api/country-index.json`: index for full country names and their coordinates
- `../api/type-index.json`: index for location types 

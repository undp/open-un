## IATI Data Process

To update the site, `iati-download.py` and `iati-process.py` must be run to download the latest IATI data and proces the downloaded XML files into a json api. 

#### Requirements

 - Python 2.6+
 - lxml
 - simplejson
 - requests

#### To update the data 

To update the data on the site, use the following steps: 

1. Run `./iati-download.py`

2. Run `./iati-process.py`


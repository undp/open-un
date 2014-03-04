#!/usr/bin/python

# Import Python Modules 
import os
import sys
import time
import traceback
import csv
import simplejson as json
from datetime import datetime
import requests

def download():
	os.mkdir('tmp')
	print "tmp/ directory created."

	print "Downloading IATI files..."

	organizations = ['undp','unops','unhabitat','wfp','unfpa']

	iatiOrgURL = 'http://www.iatiregistry.org/api/rest/dataset'
	iatiBaseURL = 'http://www.iatiregistry.org/api/rest/dataset/'

	file_count = 0

	iatiOrgs = requests.get(iatiOrgURL)
	iatiOrgsData = json.loads(iatiOrgs.text, encoding="utf-8")
	for org in iatiOrgsData:
		if org.split("-")[0] in organizations:
			if org.split("-")[1] != 'org':
				orgGet = requests.get(iatiBaseURL + org)
				orgMeta = json.loads(orgGet.text, encoding="utf-8")
				print "%s file downloaded" % org
				with open('tmp/%s.xml' % org, "wb") as content:
					getFile = requests.get(orgMeta['download_url'])
					getData = getFile.text
					content.write(getData.encode('ascii','ignore'))
					file_count = file_count + 1

	print "%d files downloaded." % file_count
	print "Downloading complete."

if __name__ == "__main__":
	download()
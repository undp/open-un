#!/usr/bin/python

# ---------------
# IATI XML Parser 
# ---------------
# Parses IATI XML into a standard json structure
# Based on v1.03 of IATI Standard
# More information on the IATI Github repo: https://github.com/IATI/IATI-Schemas
# 

# Import Python Modules 
import os
import sys
import time
import traceback
import csv
import simplejson as json
from datetime import datetime
from lxml import etree
from itertools import groupby

# Global variables
globalJSON = []
globalCountries = []

activityTop = {}
activityTopArray = []
activitySub = {}
activitySubArray = []

ctryIndex = {}

# Hard coded 2013 for prototype 
currentYear = '2013'

geo = csv.DictReader(open('country_coords.csv', 'rU'), delimiter = ',', quotechar = '"')
country_sort = sorted(geo, key = lambda x: x['iso3'])

def iatiProcess1(fn):
    global activityTop
    global currentYear

    context = iter(etree.iterparse(fn,tag='iati-activity'))
    for event, p in context:
        try:
            hierarchy = p.attrib['hierarchy']
        except:
            # Define hierarchy when this is not specified in an XML
            hierarchy = '1'

    	if hierarchy == '1':
            iatiID = p.find("./iati-identifier").text
            activityTop[iatiID] = {
                    "reporting": "",
                    "implementer": "",
                    "sector": [],
                    "country": "",
                    "location": 0,
                    "locations": [],
                    "budget": 0,
                    "expenditure": 0,
                    "title": "",
                    "description": ""
                    }
            try: 
            	ctryShort = p.find("./recipient-country").attrib
            	ctryName = p.find("./recipient-country").text
                if ctryShort.get('code') != "":
                    ctryIndex[ctryName] = ctryShort.get('code')
            except:
            	pass

            try:
                activityTop[iatiID]['title'] = p.find("./title").text
            except:
                pass

            try:
            	activityTop[iatiID]['reporting'] = p.find("./reporting-org").text.replace("-"," ")
            except:
            	activityTop[iatiID]['reporting'] = ""

            try: 
            	activityTop[iatiID]['implementer'] = p.find("./participating-org[@role='Implementing']").text
            except:
            	activityTop[iatiID]['implementer'] = ""

            try: 
            	country = p.find("./recipient-country").attrib
            	activityTop[iatiID]['country'] = country.get('code')
            except:
            	activityTop[iatiID]['country'] = ""

        # try to get sector and locations if in hierarchy = 1
            try:
                sector = p.find("./sector[@vocabulary='DAC']")
                activityTop[iatiID]['sector'].append(sector.text.replace("/"," and "))
            except:
                activityTop[iatiID]['sector'].append("Sectors Not Specified")

            try:
                locations = p.findall('location')
                if locations: 
                    locCount = 0
                    for location in locations:
                        locCount = locCount + 1
                        activityLoc = getLocations(location)
                        activityTop[iatiID]['locations'].append(activityLoc)
                    activityTop[iatiID]['location'] = locCount
                else:
                    if ctryName:
                        activityLoc = getCentroid(ctryName)
                        activityTop[iatiID]['locations'].append(activityLoc)
                        activityTop[iatiID]['location'] = 1
            except:
                pass

            # get budget and expenditure
            try:
                budgets = p.findall("./budget")
                for budget in budgets:
                    for b in budget.iterchildren(tag='value'):
                        date = b.get('value-date').split('-', 3)
                        if date[0] == currentYear:
                            amt = b.text
                            activityTop[iatiID]['budget'] = float(amt)
                transactions = p.findall('transaction')
                for tx in transactions:
                    for expen in tx.findall("./transaction-type[@code='E']"):
                        for sib in expen.itersiblings():
                            if sib.tag == 'value':
                                date = sib.get('value-date').split('-', 3)
                                if date[0] == currentYear:
                                    amt = sib.text
                                    activityTop[iatiID]['expenditure'] = float(amt)
            except:
                pass
        if hierarchy == '2':
            iatiProcess2(p)

def iatiProcess2(p):
    global activitySub

    iatiID = p.find("./iati-identifier").text
    try: 
        related = p.findall("./related-activity[@type='1']")
        for r in related:
            topID = r.get('ref')
            activityLink = topID + "-" + iatiID
            activitySub[activityLink] = {
            		"topID": topID,
            		"subID": iatiID,
            		"sector": "",
            		"location": [],
                    "budget": 0,
                    "expenditure": 0
                    }			
    except: 
        activitySub[activityLink]['topID'] = ""
    try:
        sector = p.find("./sector[@vocabulary='DAC']")
        activitySub[activityLink]['sector'] = sector.text.replace("/"," and ")
    except:
        pass
    locations = p.findall('location')
    for location in locations:
        activityLoc = getLocations(location)
        activitySub[activityLink]['location'].append(activityLoc)
    activitySubArray.append(activitySub)
    try:
        budgets = p.findall("./budget")
        for budget in budgets:
            for b in budget.iterchildren(tag='value'):
                date = b.get('value-date').split('-', 3)
                if date[0] == currentYear:
                    amt = b.text
                    activitySub[activityLink]['budget'] = float(amt)
        transactions = p.findall('transaction')
        for tx in transactions:
            for expen in tx.findall("./transaction-type[@code='E']"):
                for sib in expen.itersiblings():
                    if sib.tag == 'value':
                        date = sib.get('value-date').split('-', 3)
                        if date[0] == currentYear:
                            amt = sib.text
                            activitySub[activityLink]['expenditure'] = float(amt)
    except:
        pass

def getLocations(location):
    activityLoc = {
            "coordinates": [],
            "location-type": ""
            }
    for loc in location.iterchildren():
        if loc.tag == 'coordinates':
            lon = loc.get('longitude')
            activityLoc['coordinates'].append(lon)
            lat = loc.get('latitude')
            activityLoc['coordinates'].append(lat)
        if loc.tag == 'location-type':
            locType = loc.get('code')
            activityLoc['location-type'] = locType
    return activityLoc

def getCentroid(ctryName):
    global country_sort

    activityLoc = {
        "coordinates": [],
        "location-type": ""
        }

    for ctry in country_sort:
        if ctry['name'].decode('utf-8').lower() == ctryName.lower():
            if ctry['lon'] != "":
                lon = ctry['lon']
                activityLoc['coordinates'].append(lon)
            if ctry['lat'] != "":
                lat = ctry['lat']
                activityLoc['coordinates'].append(lat)
            activityLoc['location-type'] = "PCL"
    return activityLoc


def linkSubActivities():
    global activityTop
    global activitySub
    global globalCountries

    project_count = 0 
    for i,a in activityTop.items():
        project_count = project_count + 1
        if a['country'] not in globalCountries:
            globalCountries.append(a['country'])
        for s,b in activitySub.items():
            if i == "-".join(s.split("-")[0:3]):
                locCount = 0
                for loc in b['location']:
                    locCount = locCount + 1
                    a['locations'].append(loc)
                a['location'] = locCount
                if b['sector'] not in a['sector']:
                    a['sector'].append(b['sector'])
                a['budget'] = a['budget'] + b['budget']
                a['expenditure'] = a['expenditure'] + b['expenditure']
        globalJSON.append(a)

    print project_count	

def countryIndex():
    global ctryIndex
    global country_sort

    country_index = []
    country_count = 0
    for n,c in ctryIndex.items():
        ctryJson = {
                "country-full": "",
                "country": "",
                "country-coord": []
                }
        for ctry in country_sort:
            if ctry['name'].decode('utf-8') == n:
                country_count = country_count + 1 
                ctryJson['country-full'] = n
                ctryJson['country'] = c 
                ctryJson['country-coord'].append(ctry['lon'])
                ctryJson['country-coord'].append(ctry['lat'])
                country_index.append(ctryJson)

    writeout = json.dumps(country_index, sort_keys=True, separators=(',',':'))
    f_out = open('../../api/country-index.json', 'wb')
    f_out.writelines(writeout)
    f_out.close()
    print "country count"
    print country_count

def countryObjects():
    global globalJSON
    global globalCountries

    for ctry in globalCountries:
        if ctry != "": 
            ctryOutput = []
            for g in globalJSON:
                if g['country'] == ctry:
                    ctryOutput.append(g)
            writeout = json.dumps(ctryOutput, sort_keys=True, separators=(',',':'))
            f_out = open('../../api/countries/%s.json' % ctry.lower(), 'wb')
            f_out.writelines(writeout)
            f_out.close()

def globalOutput():
    global globalJSON

    for g in globalJSON:
        del g['budget']
        del g['expenditure']
        del g['locations']
        del g['description']
        del g['title']

    writeout = json.dumps(globalJSON, sort_keys=True, separators=(',',':'))
    f_out = open('../../api/global.json', 'wb')
    f_out.writelines(writeout)
    f_out.close()

if __name__ == "__main__":
    os.chdir("tmp/")
    for fn in os.listdir('.'):
        if fn.endswith(".xml"):
            iatiProcess1(fn)
    countryIndex()
    linkSubActivities()
    countryObjects()
    globalOutput()

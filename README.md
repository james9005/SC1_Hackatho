# OSISoft-Virtual-Hackathon-2017-SC1

This repository serves as the submission for the OSISoft Virtual Hackathon 2017.
Members: Alexander Dixon, Gregor Emslie, Michael Nelson, James Todd

The goal of this project was to map flight data of planes and helicopters above the aberdeen office to Event Frames within PI Asset Framework, and visualise these using PI Vision.

Two PI Vision extensions were created to visualise this data.

## FlightMap Extension
The FlightMap extension was created to visualise overhead flights using the javascript mapping tool,  [Leaflet.js](https://www.leafletjs.com). This open source mapping tool allowed data collected within Event Frames to be visualised within PI Vision. The PIWebAPI was utilised to bring this data in using streamset calls to the relevant event frames needed. Static 'landing points' were created and pulled in from an AF database table which showed offshore platforms and landing zones loaded as markers statically. Event Frames, generated from the flight data were then loaded in every 30 seconds to update the planes and helicopters that were created as markers on the map. Custom icons were created for the markers to show Landing zones, offshore platforms, planes and helicopters. Clicking on any of the markers would show a popup with more details about the flight/landing zone.

## EFTable extension
The EFTable extension was created to visualise, in tabular form, each flight that was currently taking place. Flight data collected within Event Frames was pulled via the PIWebAPI and written to an angular table within PIVision, updating every 30 seconds. 

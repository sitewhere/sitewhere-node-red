# SiteWhere Node-RED Integration
Allows <a href="http://nodered.org" target="_new">Node-RED</a> to interact with the SiteWhere Open IoT Platform.

## Installation
Run the following command in the root directory of your Node-RED install:

	npm install node-red-contrib-sitewhere

## Usage
This module allows a device running Node-RED to interact with SiteWhere via JSON over 
the MQTT protocol. It supports the following concepts:

* Registration of a new device with SiteWhere
* Sending measurements, alerts, and location data to SiteWhere
* Receiving system commands and custom commands from SiteWhere

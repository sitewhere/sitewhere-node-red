/**
 * Copyright 2016 SiteWhere LLC.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

module.exports = function(RED) {
	"use strict";

	/** SiteWhere Configuration Node */
	function SiteWhereConfig(n) {
		RED.nodes.createNode(this, n);
		this.hwid = n.hwid;
		this.specification = n.specification;
		this.site = n.site;
	}
	RED.nodes.registerType("sw-config", SiteWhereConfig);

	/** SiteWhere node for registering a device */
	function SiteWhereRegisterNode(n) {
		RED.nodes.createNode(this, n);
		var node = this;

		// Get handle to selected SiteWhere configuration.
		this.config = RED.nodes.getNode(n.config);

		this.on("input", function(msg) {
			if (this.config) {
				var wrapper = {};
				wrapper.hardwareId = this.config.hwid;
				wrapper.type = "RegisterDevice";

				// Create registration message.
				var request = {};
				request.hardwareId = this.config.hwid;
				request.specificationToken = this.config.specification;
				request.siteToken = this.config.site;
				wrapper.request = request;

				// Forward to transport.
				msg.payload = JSON.stringify(wrapper);
				node.send(msg);
			} else {
				this.info("No configuration found!");
			}
		});
	}
	RED.nodes.registerType("sw-register", SiteWhereRegisterNode);

	/** SiteWhere node for sending a location */
	function SiteWhereSendLocation(n) {
		RED.nodes.createNode(this, n);
		var node = this;

		// Get handle to selected SiteWhere configuration.
		this.config = RED.nodes.getNode(n.config);

		this.on("input", function(msg) {
			if (this.config) {
				var wrapper = {};
				wrapper.hardwareId = this.config.hwid;
				wrapper.type = "DeviceLocation";

				// Create device location message.
				var request = {};
				request.latitude = msg['sw:latitude'] || n.latitude;
				request.longitude = msg['sw:longitude'] || n.longitude;
				request.elevation = msg['sw:elevation'] || n.elevation;
				request.updateState = n.updateState;
				request.eventDate = (new Date()).toISOString();
				wrapper.request = request;

				// Forward to transport.
				msg.payload = JSON.stringify(wrapper);
				node.send(msg);
			} else {
				this.info("No configuration found!");
			}
		});
	}
	RED.nodes.registerType("sw-send-location", SiteWhereSendLocation);

	/** SiteWhere node for sending measurements */
	function SiteWhereSendMeasurements(n) {
		RED.nodes.createNode(this, n);
		var node = this;

		// Get handle to selected SiteWhere configuration.
		this.config = RED.nodes.getNode(n.config);

		this.on("input", function(msg) {
			if (this.config) {
				var wrapper = {};
				wrapper.hardwareId = this.config.hwid;
				wrapper.type = "DeviceMeasurements";

				// Create device measurements message.
				var request = {};

				// Find message properties that start with 'mx:'.
				var mxs = {};
				if (n.mxname && n.mxname.length > 0) {
					mxs[n.mxname] = n.mxvalue;
				}

				// Add msg properites that start with mx: and are numeric
				Object.getOwnPropertyNames(msg).forEach(function(val, idx, array) {
					if (val.startsWith('mx:') && msg[val].toFixed) {
						mxs[val.substring(3)] = msg[val];
					}
				});

				request.measurements = mxs;
				request.updateState = n.updateState;
				request.eventDate = (new Date()).toISOString();
				wrapper.request = request;

				// Forward to transport.
				msg.payload = JSON.stringify(wrapper);
				node.send(msg);
			} else {
				this.info("No configuration found!");
			}
		});
	}
	RED.nodes.registerType("sw-send-measurements", SiteWhereSendMeasurements);
}
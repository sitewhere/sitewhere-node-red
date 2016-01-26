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
				request.originator = msg['sw:originator'];
				wrapper.type = "DeviceLocation";

				// Create device location message.
				var request = {};
				request.latitude = msg['sw:latitude'] || n.latitude;
				request.longitude = msg['sw:longitude'] || n.longitude;
				request.elevation = msg['sw:elevation'] || n.elevation;
				request.updateState = n.updstate;
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
				request.originator = msg['sw:originator'];
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
				request.updateState = n.updstate;
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

	/** SiteWhere node for sending alerts */
	function SiteWhereSendAlert(n) {
		RED.nodes.createNode(this, n);
		var node = this;

		// Get handle to selected SiteWhere configuration.
		this.config = RED.nodes.getNode(n.config);

		this.on("input", function(msg) {
			if (this.config) {
				var wrapper = {};
				wrapper.hardwareId = this.config.hwid;
				request.originator = msg['sw:originator'];
				wrapper.type = "DeviceAlert";

				// Create device alert message.
				var request = {};
				request.type = msg['sw:alertType'] || n.atype;
				request.level = msg['sw:alertLevel'] || n.alevel;
				request.message = msg['sw:alertMessage'] || n.amessage;
				request.updateState = n.updstate;
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
	RED.nodes.registerType("sw-send-alert", SiteWhereSendAlert);

	/** SiteWhere node for sending an acknowledgement */
	function SiteWhereAcknowledge(n) {
		RED.nodes.createNode(this, n);
		var node = this;

		// Get handle to selected SiteWhere configuration.
		this.config = RED.nodes.getNode(n.config);

		this.on("input", function(msg) {
			if (this.config) {
				var wrapper = {};
				wrapper.hardwareId = this.config.hwid;
				wrapper.type = "Acknowledge";

				// Create device location message.
				var request = {};
				request.response = msg['sw:response'] || n.response;
				request.originatingEventId = msg['sw:originator'];
				request.updateState = n.updstate;
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
	RED.nodes.registerType("sw-acknowledge", SiteWhereAcknowledge);

	/** SiteWhere node for parsing command details */
	function SiteWhereParseCommand(n) {
		RED.nodes.createNode(this, n);
		var node = this;

		this.on("input", function(msg) {
			var data = JSON.parse(msg.payload);
			if (data) {
				msg['sw:command'] = data.command.command.name;
				msg['sw:parameters'] = data.command.invocation.parameterValues;
				msg['sw:originator'] = data.command.invocation.id;
				msg['sw:initiator'] = data.command.invocation.initiator;
				msg['sw:initiatorId'] = data.command.invocation.initiatorId;
				msg.payload = data.command.command.name;
				node.send(msg);
			}
		});
	}
	RED.nodes.registerType("sw-parse-command", SiteWhereParseCommand);
}
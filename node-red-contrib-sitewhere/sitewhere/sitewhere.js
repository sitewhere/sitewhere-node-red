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

	/** SiteWhere Registration Node */
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
				var registration = {};
				registration.hardwareId = this.config.hwid;
				registration.specificationToken = this.config.specification;
				registration.siteToken = this.config.site;
				wrapper.request = registration;

				// Forward to transport.
				msg.payload = JSON.stringify(wrapper);
				node.send(msg);
			} else {
				this.info("No configuration found!");
			}
		});
	}
	RED.nodes.registerType("sw-register", SiteWhereRegisterNode);
}
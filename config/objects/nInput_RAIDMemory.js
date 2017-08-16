/**
 * <odoc>
 * <key>nattrmon.nInput_RAIDMemory(aMap) : nInput</key>
 * aMap is composed of:\
 *    - keys (a key string or an array of keys for an AF object)
 *    - chKeys (a channel name for the keys of AF objects)
 *    - attrTemplate (a template for the name of the attribute))
 *    - single (boolean when false display the corresponding key)
 * </odoc>
 */
var nInput_RAIDMemory = function(anMonitoredAFObjectKey, attributePrefix) {
	// Set server if doesn't exist
	if (isObject(anMonitoredAFObjectKey)) {
		this.params = anMonitoredAFObjectKey;
		// If keys is not an array make it an array.
		if (!(isArray(this.params.keys))) {
			this.params.keys = [ this.params.keys ];
			this.params.single = true;
		} else {
			this.params.single = false;
		}

		if (isUnDef(this.params.attrTemplate)) 
			this.params.attrTemplate = "Server status/Memory";
	
	} else {
		if (nattrmon.isObjectPool(anMonitoredAFObjectKey)) {
			this.params.keys = anMonitoredAFObjectKey;
			//this.objectPoolKey = anMonitoredAFObjectKey;
			//this.monitoredObjectKey = anMonitoredAFObjectKey; // just for reference
		} 

		if (isDef(this.attributePrefix)) {
			this.params.attrTemplate = this.attributePrefix;
		} else {
			this.params.attrTemplate = "Server status/Memory";
		}
		//this.attributePrefix = (isUndefined(attributePrefix)) ? "Server status/Memory " : attributePrefix;
	}

	nInput.call(this, this.input);
}
inherit(nInput_RAIDMemory, nInput);

nInput_RAIDMemory.prototype.__getMemory = function(aKey) {
	var ret = {};
	var freemem  = -1;
	var usedmem  = -1;
	var maxmem   = -1;
	var totalmem = -1;

	try {
		var mems;
		var parent = this;
		nattrmon.useObject(aKey, function(s) {
			try {
				mems = s.exec("StatusReport", {}).MemoryInfo;
			} catch(e) {
				logErr("Error while retrieving memory using '" + aKey + "': " + e.message);
				throw e;
			}		
		});

		freemem = Math.round(Number(mems.FreeHeapMemory.replace(/MB/,"")));
		usedmem = Math.round(Number(mems.UsedHeapMemory.replace(/MB/,"")));
		maxmem = Math.round(Number(mems.MaxMemory.replace(/MB/,"")));
		totalmem = Math.round(Number(mems.TotalHeapMemory.replace(/MB/,"")));
	} catch(e) {
		logErr("Error while retrieving memory using '" + aKey + "': " + e.message);
	}

	if(!this.params.single) {
		ret = {"Free heap (MB)": freemem, "Used heap (MB)": usedmem, "Total heap (MB)": totalmem, "Max memory (MB)": maxmem};
	} else {
		ret = {"Name": aKey, "Free heap (MB)": freemem, "Used heap (MB)": usedmem, "Total heap (MB)": totalmem, "Max memory (MB)": maxmem};
	}

	return ret;
}

nInput_RAIDMemory.prototype.input = function(scope, args) {
	var res = {};
	var arr = [];

	if (isDef(this.params.chKeys)) this.params.keys = $stream($ch(this.params.chKeys).getKeys()).map("key").toArray();

	for(var i in this.params.keys) {
		arr.push(this.__getMemory(this.params.keys[i]));
	}

	res[templify(this.params.attrTemplate)] = arr;
	return res;
}
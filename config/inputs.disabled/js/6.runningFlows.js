for(var i in raidServers) {
   nattrmon.addInput(
     { "name"         : "Running flows " + raidServers[i].name,
       "timeInterval" : 2000,
       "waitForFinish": true,
       "onlyOnEvent"  : true },
     new nInput_RunningFlows(i, "Server status/" + raidServers[i].name + " running flows")
   );
}
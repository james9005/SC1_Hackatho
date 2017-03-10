[Reflection.Assembly]::LoadWithPartialName("OSIsoft.AFSDK")
[Reflection.Assembly]::LoadWithPartialName("OSIsoft.AFSDK.AF.EventFrame")

$serverName = "localhost"
$server = [OSIsoft.AF.PISystem]::CreatePISystem($serverName)
$myDB = [OSIsoft.AF.AFDatabase]$server.Databases["Hackathon"].Database
$FlightTemplate= [OSIsoft.AF.Asset.AFElementTemplate]$mydb.ElementTemplates["Flight"]
$knownAircraft = @{""=""}
$knownAircraftHEX = @{""=""}
$request = 'WEBSERVER NAME'

#Get all the existing eventframes for today
$date = Get-Date -format d
$searchString = "Name:*" + $date
[OSIsoft.AF.Search.AFEventFrameSearch] $search = new-object OSIsoft.AF.Search.AFEventFrameSearch($myDB, "FindEvents", $searchString)
$results = New-Object "System.Collections.Generic.List``1[OSIsoft.AF.EventFrame.AFEventFrame]" $search.FindEventFrames(0,$TRUE,0)

#Load All the event frames for flights we are interested in
foreach ($foundEF in $results){
    [OSIsoft.AF.EventFrame.AFEventFrame] $EF =  [OSIsoft.AF.EventFrame.AFEventFrame]::FindEventFrame($server,[GUID]$foundEF.UniqueID)
    "Adding Scheduled Flight:"+$foundEF.Name
     $knownAircraft.add($EF.Name,$EF)
}

While($TRUE){
#Get the current flights from the raspberry PI
$result = Invoke-WebRequest $request | ConvertFrom-Json

#For all the aircraft that are being tracked in the JSON file
foreach ($aircraft in $result.aircraft){

    #First we are interested in flight with flight numbers
    if($aircraft.flight -ne $null){
            $EFName = $aircraft.flight.Trim() + "-" + $date
            #And were only interested in flights we have already created an event frame for.
            if ($knownAircraft.containsKey($EFName)){
                "I know about """ + $aircraft.hex +""" updating existing Event Frame " +$EF.Name
                $EF = $knownAircraft[$EFName]
                if ($aircraft.seen -gt 90) {
                    #We've lost comms to this chopper, we should set the current positions to bad while we still can
                    "Last seen more than 90 seconds ago - Setting Values to Bad"
                    $EF.Attributes["currentlat"].setValue("Bad")
                    $EF.Attributes["currentlon"].setValue("Bad")
                    $EF.Attributes["speed"].setValue("0")
                    $EF.Attributes["altitude"].setValue("0")
                    $EF.Attributes["verticalrate"].setValue("0")
                    if ($aircraft.seen) {$EF.Attributes["lastseen"].setValue($aircraft.seen)}
                } else {
                    #Theres current data available, we should store that into the eventframe
                    if ($aircraft.squawk) {$EF.Attributes["squawk"].setValue($aircraft.squawk)}
                    if ($aircraft.flight) {$EF.Attributes["flightnumber"].setValue($aircraft.flight)}
                    if ($aircraft.lat) {$EF.Attributes["currentlat"].setValue($aircraft.lat)}
                    if ($aircraft.lon) {$EF.Attributes["currentlon"].setValue($aircraft.lon)}
                    if ($aircraft.speed) {$EF.Attributes["speed"].setValue($aircraft.speed)}
                    if ($aircraft.vert_rate) {$EF.Attributes["verticalRate"].setValue($aircraft.vert_rate)}
                    if ($aircraft.category) {$EF.Attributes["category"].setValue($aircraft.category)}
                    if ($aircraft.track) {$EF.Attributes["heading"].setValue($aircraft.track)}
                    if ($aircraft.seen) {$EF.Attributes["lastseen"].setValue($aircraft.seen)}
                    if ($aircraft.altitude) {$EF.Attributes["altitude"].setValue($aircraft.altitude)}
                    if ($aircraft.hex) {$EF.Attributes["ICAO"].setValue($aircraft.hex)}
                    if ($aircraft.messages) {$EF.Attributes["messages"].setValue($aircraft.messages)}
                }
                $mydb.checkin()
                if ($knownAircraftHEX.containsKey($aircraft.hex)){
                }else{
                    $knownAircraftHEX.add($aircraft.hex,$EF)
                }
            } else {
                #Theres No Event Frame, so I'm not interested in this flight
            }
        }else {
        #Theres data for the aircraft but no flight number.
        if($knownAircraftHEX.containsKey($aircraft.hex)){
            #If we know about it we should continue to update
            "I still know about """ + $aircraft.hex +""" updating existing Event Frame " +$EF.Name
            $EF = $knownAircraftHex[$aircraft.hex]
            if ($aircraft.seen -gt 90) {
                #We've lost comms to this chopper, we should set the current positions to bad while we still can
                "Last seen more than 90 seconds ago - Setting Values to Bad"
                $EF.Attributes["currentlat"].setValue("Bad")
                $EF.Attributes["currentlon"].setValue("Bad")
                $EF.Attributes["speed"].setValue("0")
                $EF.Attributes["altitude"].setValue("0")
                $EF.Attributes["verticalrate"].setValue("0")
                if ($aircraft.seen) {$EF.Attributes["lastseen"].setValue($aircraft.seen)}
         }
    }
        }
  }
 Start-Sleep 1
}

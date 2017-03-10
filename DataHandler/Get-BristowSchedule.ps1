
[Reflection.Assembly]::LoadWithPartialName("OSIsoft.AFSDK")
[Reflection.Assembly]::LoadWithPartialName("OSIsoft.AFSDK.AF.EventFrame")

$serverName = "localhost"
$server = [OSIsoft.AF.PISystem]::CreatePISystem($serverName)
$myDB = [OSIsoft.AF.AFDatabase]$server.Databases["Hackathon"].Database
$FlightTemplate= [OSIsoft.AF.Asset.AFElementTemplate]$mydb.ElementTemplates["Flight"]
$date = Get-Date -format d

$r=Invoke-WebRequest "http://bristowgroup.com/clients/flight-status/" -SessionVariable bristowsSession

$bristowsSession

$cookie = $r.headers.'Set-Cookie'.split(";")
$startLocn = $cookie[1].IndexOf("csrftoken=")
$token = $cookie[1].Substring(($startLocn+10),($cookie[1].length-18))
$form = $r.Forms[0]
$form | Format-List
$form.fields
$form.Fields["csrfmiddlewaretoken"] = $token
$form.Fields["base"] = "1"
$form.Fields["request_date"] = Get-Date -format "dd-MMM-yyyy"
$form.fields["submit"]="submit"
$r=Invoke-WebRequest -Uri ("http://bristowgroup.com/clients/flight-status/") -WebSession $bristowsSession -Method POST -Body $form.Fields

$data = $r.AllElements | Where Class -eq "flight-status" | Select -First 1
$html = $r.AllElements | Where tagName -eq "TR"

foreach ($row in $html){
     $values = $row.innerHTML -split ("<td")
     $departTime= ""
     $ATD=""
     $FNO=""
     $Company=""
     $ETA=""
     $status=""
     $routing=""

     $departTime = $values[2].substring(($values[2].IndexOf(">")+1),5).trim()
     $ATD =$values[3].substring(1,($values[3].IndexOf("</td>")-1)).trim()
     $FNO = "BHL" + $Values[4].substring(1,($values[4].IndexOf("</td>")-1)).trim()
     $Company=$Values[5].substring(1,($values[5].IndexOf("</td>")-1)).trim()
     $ETA=$values[6].substring(1,($values[6].IndexOf("</td>")-1)).trim()
     $status=$values[7].substring(1,($values[7].IndexOf("</td>")-1)).trim()
     $routing=$values[8].substring(1,($values[8].IndexOf("</td>")-1)).trim()
     $FNO + $departTime + $routing

     if ($company -eq "COMPANY NAME") {
        $EFName = $FNO + "-" + $date
        [OSIsoft.AF.EventFrame.AFEventFrame] $EF = new-object OSIsoft.AF.EventFrame.AFEventFrame ($myDB,$EFName,$FlightTemplate)
        $EF.setStartTime($departTime)
        $EF.Attributes["Company"].setValue($company)
        $EF.Attributes["Routing"].setValue($routing)
        $EF.Attributes["ETA"].setValue($eta)
        $myDB.Checkin()
        $EF.setEndTime($date +" "+$ETA)
        $myDB.checkin()

     }

}

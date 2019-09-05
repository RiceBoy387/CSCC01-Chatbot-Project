Set-PSDebug -Trace 0
$passed = 0
$failed = 0

Write-Host "Please run with a clean instance of the indexer" -ForegroundColor RED
Write-Host "====================================TESTING CONNECTION TO INDEXER====================================" -ForegroundColor YELLOW

scrapy crawl url --nolog -a url=https://example.com -s DEPTH_LIMIT=0

$get = @{"query"="illustrative example"; "field"="0"; "numRes"="10"}

$content = (Invoke-WebRequest -Uri http://localhost:1021/search -Method GET -Body $get).content


$expected = "0)  Example Domain`n"
$expected += "     Example Domain`n"
$expected += "     https://example.com`n"
$expected += "1)  Example Domain`n"
$expected += "     This domain is established to be used for illustrative examples in documents. You may use this   domain in examples without prior coordination or asking for permission.`n"
$expected += "     https://example.com`n"


ECHO "==============================================================================================="
ECHO "CONTENT:"
ECHO $content
ECHO "==============================================================================================="
ECHO "EXPECTED CONTENT:"
ECHO $expected

If ($content -eq $expected){
	Write-Host "TEST CASE PASSED" -ForegroundColor green
    $passed += 1
} Else {
	Write-Host "TEST CASE FAILED" -ForegroundColor red
    $failed += 1
}

Write-Host "====================================TESTING RAW FILE OUTPUT====================================" -ForegroundColor YELLOW

D:
cd samples

$outputFile = gci . | sort LastWriteTime | select -last 1
$fileContent = type $outputFile

$fileContent = $fileContent -replace '\(\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\)','(###################)'
$fileContent = $fileContent -replace '\(\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d-title\)','(###################-title)'
$fileContent = $fileContent -replace '\(\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d\d-link\)','(###################-link)'
$fileContent = ECHO $fileContent


$expectedFileContent = "(###################-title) Example Domain`n"
$expectedFileContent += "(###################) This domain is established to be used for illustrative examples in documents. You may use this   domain in examples without prior coordination or asking for permission.`n"
$expectedFileContent += "(###################) More information...`n"
$expectedFileContent += "(###################-link) https://example.com`n"


$fileContent = ECHO $expectedFileContent

ECHO "==============================================================================================="
ECHO "CONTENT:"
ECHO $fileContent
ECHO "==============================================================================================="
ECHO "EXPECTED CONTENT:"
ECHO $expectedFileContent

If ($fileContent -eq $expectedFileContent){
	Write-Host "TEST CASE PASSED" -ForegroundColor green
    $passed += 1
} Else {
	Write-Host "TEST CASE FAILED" -ForegroundColor red
    $failed += 1
}

ECHO "Test cases passed:  $passed  `tTest cases failed:   $failed"

PAUSE
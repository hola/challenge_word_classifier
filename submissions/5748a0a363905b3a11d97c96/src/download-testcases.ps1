$TestCasePath = 'C:\Users\guill_000\Documents\Visual Studio 2013\Projects\HolaGen\testcases'
$TestCaseURL = 'https://hola.org/challenges/word_classifier/testcase'

Function Get-RedirectedUrl {
 
    Param (
        [Parameter(Mandatory=$true)]
        [String]$URL
    )
 
    $request = [System.Net.WebRequest]::Create($url)
    $request.AllowAutoRedirect = $false
    $response = $request.GetResponse()
 
    If ($response.StatusCode -eq "Found")
    {
        $location = $response.GetResponseHeader("Location")
		$response.Dispose()
		return $location
    }
}

Function Download-TestCase() {
	$RedirectURL = Get-RedirectedUrl $TestCaseURL
	$RedirectURL = "https://hola.org$RedirectURL"
	$Seed = Split-Path $RedirectURL -Leaf
	$Filename = Join-Path $TestCasePath "$Seed.json"
	Write-Host "Downloading $RedirectURL to $Filename"
	$client = (New-Object System.Net.WebClient)
	$client.DownloadFile($RedirectURL, $Filename)
	$client.Dispose()
	# Invoke-WebRequest -Uri  -OutFile 
}

1..20000 | % { Download-TestCase }

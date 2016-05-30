@if %computername%==NUTS (
	"Y:\Program Files\nodejs"\node.exe %*
) else (
	..\nodejs\node.exe %*
)
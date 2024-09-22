Set oShell = CreateObject("WScript.Shell") 
Dim strArgs
strArgs = "cmd /c LinkList.bat"
oShell.Run strArgs, 0, False
(for /r "js" %%F in (*.txt) do echo "%%F")
@echo off
>concat.txt (for /r "txt" %%F in (*.txt) do type "%%F")

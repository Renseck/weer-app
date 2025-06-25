@echo off

REM Open everything in a new WT window with named tabs
wt ^
nt --title "XAMPP Services" -d "C:\xampp" cmd /k "xampp_start.exe apache mysql" ^
; nt --title "WeatherService" -d "backend\WeatherService" cmd /k "dotnet run" ^
; nt --title "API Service" -d "backend\WeatherService.API" cmd /k "dotnet run" ^
; nt --title "Angular App" -d "frontend" cmd /k "ng serve"

C:\> timeout 5

REM Launch browser at localhost:4200
start firefox http://localhost:4200
start firefox http://localhost:5216/swagger/index.html
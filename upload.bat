@echo off
cd C:\Projects\golf-pub-app
git add .
git commit -m "update"
git push
powershell Compress-Archive -Path * -DestinationPath "../golf-pub.zip" -Force
echo 완료!
pause
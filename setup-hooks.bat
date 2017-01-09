@echo off


echo Copy hooks to .git repo
xcopy "hooks\prepare-commit-msg" ".git\hooks\" /y

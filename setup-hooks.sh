#!/bin/sh
# This script is for setting up git hooks

#Copies the hooks to the .git directory
cp hooks/prepare-commit-msg .git/hooks/prepare-commit-msg

exit 1;

#! /bin/bash
# Get all content types from crawling output

jq -r '.data[].headers."content-type"' $1 | sort | uniq


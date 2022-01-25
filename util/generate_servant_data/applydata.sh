#!/bin/sh

INPUT_DIR=output/
DEST_DIR=../../src/fgo

cp -v $INPUT_DIR/servantdata.json.gz $INPUT_DIR/skills.json.gz $INPUT_DIR/servantid2msid.json $INPUT_DIR/servantnames.json $INPUT_DIR/costumes.json $INPUT_DIR/bgms.json \
   $DESTINATION ../../src/fgo
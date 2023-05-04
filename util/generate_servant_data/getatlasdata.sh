#!/bin/sh

INPUT_DIR=input/

mkdir -p $INPUT_DIR

curl -o $INPUT_DIR/0_atlas.json -z $INPUT_DIR/0_atlas.json 'https://api.atlasacademy.io/export/JP/nice_servant.json'
curl -o $INPUT_DIR/6_bgm.json -z $INPUT_DIR/6_bgm.json 'https://api.atlasacademy.io/export/JP/nice_bgm.json'
curl -o $INPUT_DIR/9_bondequip.json -z $INPUT_DIR/9_bondequip.json https://api.atlasacademy.io/export/JP/nice_equip.json

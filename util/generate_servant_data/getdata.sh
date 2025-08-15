#!/bin/sh

INPUT_DIR=input/

mkdir -p $INPUT_DIR

curl -o $INPUT_DIR/0_atlas.json -z $INPUT_DIR/0_atlas.json 'https://api.atlasacademy.io/export/JP/nice_servant.json'
curl -o $INPUT_DIR/6_bgm.json -z $INPUT_DIR/6_bgm.json 'https://api.atlasacademy.io/export/JP/nice_bgm.json'
curl -o $INPUT_DIR/9_bondequip.json -z $INPUT_DIR/9_bondequip.json https://api.atlasacademy.io/export/JP/nice_equip.json

curl -o $INPUT_DIR/1_servants.csv 'https://docs.google.com/spreadsheets/d/1KwwztukPMpT8KzdFxQsmm2gbCaRQqE-7/gviz/tq?gid=1498357704&tqx=out:csv'
curl -o $INPUT_DIR/5_costume.csv 'https://docs.google.com/spreadsheets/d/1KwwztukPMpT8KzdFxQsmm2gbCaRQqE-7/gviz/tq?gid=675248781&tqx=out:csv'
curl -o $INPUT_DIR/7_classscore.csv 'https://docs.google.com/spreadsheets/d/1KwwztukPMpT8KzdFxQsmm2gbCaRQqE-7/gviz/tq?gid=14303726&tqx=out:csv'

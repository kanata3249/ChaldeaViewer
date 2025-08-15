#!/bin/sh

OUTPUT_DIR=output/
INPUT_DIR=../input/

mkdir -p $OUTPUT_DIR
cd $OUTPUT_DIR

#node ../csv2servantdata.js $INPUT_DIR/0_atlas.json $INPUT_DIR/1_servants.csv $INPUT_DIR/2_skills.csv
node ../json2servantdata.js $INPUT_DIR/0_atlas.json $INPUT_DIR/1_servants.csv $INPUT_DIR/2_skills.csv
node ../csv2classscore.js $INPUT_DIR/7_classscore.csv
node ../gencostume.js $INPUT_DIR/0_atlas.json $INPUT_DIR/5_costume.csv
node ../genbgm.js $INPUT_DIR/6_bgm.json

#!/bin/sh

OUTPUT_DIR=output/
INPUT_DIR=../input/

mkdir -p $OUTPUT_DIR
cd $OUTPUT_DIR

node ../csv2servantdata.js $INPUT_DIR/1_servants.csv $INPUT_DIR/2_skills.csv $INPUT_DIR/3_items.csv $INPUT_DIR/4_appendSkill.csv
node ../gencostume.js $INPUT_DIR/0_atlas.json $INPUT_DIR/5_costume.csv
node ../genbgm.js $INPUT_DIR/6_bgm.json
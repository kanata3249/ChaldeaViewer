#!/bin/sh

INPUT_DIR=input/

mkdir -p $INPUT_DIR

curl -o $INPUT_DIR/1_servants.csv 'https://docs.google.com/spreadsheets/d/1KwwztukPMpT8KzdFxQsmm2gbCaRQqE-7/gviz/tq?gid=1498357704&tqx=out:csv'
curl -o $INPUT_DIR/2_skills.csv 'https://docs.google.com/spreadsheets/d/1KwwztukPMpT8KzdFxQsmm2gbCaRQqE-7/gviz/tq?gid=1242219468&tqx=out:csv'
curl -o $INPUT_DIR/3_items.csv 'https://docs.google.com/spreadsheets/d/1KwwztukPMpT8KzdFxQsmm2gbCaRQqE-7/gviz/tq?gid=1300403258&tqx=out:csv'
curl -o $INPUT_DIR/4_appendSkill.csv 'https://docs.google.com/spreadsheets/d/1KwwztukPMpT8KzdFxQsmm2gbCaRQqE-7/gviz/tq?gid=387834776&tqx=out:csv'
curl -o $INPUT_DIR/5_costume.csv 'https://docs.google.com/spreadsheets/d/1KwwztukPMpT8KzdFxQsmm2gbCaRQqE-7/gviz/tq?gid=675248781&tqx=out:csv'
curl -o $INPUT_DIR/7_classscore.csv 'https://docs.google.com/spreadsheets/d/1KwwztukPMpT8KzdFxQsmm2gbCaRQqE-7/gviz/tq?gid=14303726&tqx=out:csv'

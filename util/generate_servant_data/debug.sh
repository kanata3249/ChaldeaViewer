
cd output;
node ../atlasjson2servantdata.js ../input/0_atlas.json $1;
cd ..
node.exe diff.js > output/diff.txt
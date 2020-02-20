rm -rf ../docs/*;
echo "tpelements.com" > ../docs/CNAME
#node --inspect-brk\
  ../node_modules/.bin/docco\
  -p ./plugin.js\
	-c tpe.css\
       	-t tpe.ejs\
       	-o ../docs\
       	index.md\
       	api.md\
       	guides.md\
       	guides/*\
        routify.js
cp -r ./images ../docs/

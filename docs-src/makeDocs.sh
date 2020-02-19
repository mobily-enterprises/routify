rm -rf ../docs/*;
echo "tpelements.com" > ../docs/CNAME
#node --inspect-brk\
  ../node_modules/.bin/docco\
  -p ./plugin.js\
	-c tpe.css\
       	-t tpe.ejs\
       	-o ../docs\
       	index.md\
       	quickstart-designers.md\
       	tutorials-designers.md\
       	tutorials-designers/*\
       	quickstart-developers.md\
       	tutorials-developers.md\
       	tutorials-developers/*\
        appendices.md\
        appendices/*.md
cp -r ./images ../docs/

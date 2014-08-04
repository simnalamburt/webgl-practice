all: index.html
index.html: script.ls.js
script.ls.js: script.ls
	lsc -p -c $< > $@

clean:
	rm -f script.ls.js

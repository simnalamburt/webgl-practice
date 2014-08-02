all: index.html
index.html: script.js
script.js: script.ls
	lsc -c $<

clean:
	rm -f script.js

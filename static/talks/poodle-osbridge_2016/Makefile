
index.html: index.markdown
	pandoc -t revealjs -f markdown+definition_lists \
		-s index.markdown -o index.html \
		-V revealjs-url=https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.3.0 \
		-V transition=none
	sed -i'' 's:theme/[a-z_]\+.css:theme/white.css:' index.html

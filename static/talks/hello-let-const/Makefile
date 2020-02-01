
index.html: index.markdown
	pandoc -t revealjs -f markdown+definition_lists \
		-s index.markdown -o index.html \
		-V revealjs-url=https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.0.0 \
		-V transition=none \
		--highlight-style=zenburn
	sed -i'' s/simple.css/black.css/ index.html

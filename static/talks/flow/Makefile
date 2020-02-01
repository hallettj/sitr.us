
index.html: flow.markdown
	pandoc -t revealjs -f markdown+definition_lists \
		-s flow.markdown -o index.html \
		-V revealjs-url=https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.0.0 \
		-V transition=slide \
		--highlight-style=zenburn
	sed -i'' s/simple.css/black.css/ index.html

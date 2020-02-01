
index.html: rust-pam.markdown
	pandoc -t revealjs -f markdown+definition_lists \
		-s rust-pam.markdown -o index.html \
		-V revealjs-url=https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.0.0 \
		-V transition=slide \
		--highlight-style=zenburn
	sed -i'' s/simple.css/black.css/ index.html

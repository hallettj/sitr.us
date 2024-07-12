{
  decrypt-assets,
  writeNushellApplication,
  zola
}:

writeNushellApplication {
  name = "build";
  runtimeInputs = [ decrypt-assets zola ];
  text = ''
    # Deletes the output directory if there is one and builds the site
    def main [
      --base-url (-u): string            # Force the base URL to be that value (defaults to the one in config.toml)
      --output-dir (-o): string = public # Outputs the generated site in the given path
      --drafts                           # Include drafts when loading the site
    ] {
      let flags = [
        (if ($base_url != null) { [--base-url $base_url] } else { [] })
        (if ($drafts) { [--drafts] } else { [] })
        [--output-dir $output_dir --force]
      ] | flatten
      zola build ...$flags
      decrypt-assets --output-dir $output_dir
    }
  '';
}

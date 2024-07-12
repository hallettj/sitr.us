{ gnupg
, gnutar
, writeNushellApplication
}:

writeNushellApplication {
  name = "decrypt-assets";
  runtimeInputs = [ gnupg gnutar ];
  text = builtins.readFile ./decrypt-assets.nu;
}

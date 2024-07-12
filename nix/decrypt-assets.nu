# Decrypt assets and install them in the given directory. May be called
# interactively to decrypt with a GPG key. Or if the environment variable
# `ASSETS_KEY` is then that value will be used as a symmetric decryption key.
def main [
  --output-dir (-o): string = static                         # directory to unpack assets in 
  encrypted_assets: string = static/encrypted_assets.tar.gpg # encrypted assets file
] {
  if "ASSETS_KEY" in $env and ($env.ASSETS_KEY | is-not-empty) {
    non_interactive --output-dir $output_dir --passphrase $env.ASSETS_KEY $encrypted_assets
  } else {
    interactive --output-dir $output_dir $encrypted_assets
  }
}

def interactive [
  --output-dir: string
  encrypted_assets: string
] {
  gpg --decrypt $encrypted_assets
    | tar --directory $output_dir -xf -
}

def non_interactive [
  --output-dir: string
  --passphrase: string
  encrypted_assets: string
] {
  gpg --batch --decrypt --no-symkey-cache --passphrase $passphrase $encrypted_assets
    | tar --directory $output_dir -xf -
}

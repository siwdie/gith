class Gith < Formula
  desc "Configurable git workflow CLI with branch creation, rebase, commit, and squash helpers"
  homepage "https://github.com/siwdie/gith"
  version "1.7.0"
  license "MIT"

  on_arm do
    url "https://github.com/siwdie/gith/releases/download/v1.7.0/gith-v1.7.0-macos-arm64"
    sha256 "e79a78616be70e2a1f722323b660e53a1f45a548b47cb605035670ae43bf05b0"
  end

  def install
    odie "gith is currently available only for Apple Silicon (arm64)." unless Hardware::CPU.arm?

    bin.install "gith-v1.7.0-macos-arm64" => "gith"
  end

  test do
    system "#{bin}/gith", "--version"
  end
end

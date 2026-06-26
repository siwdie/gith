class Gith < Formula
  desc "Configurable git workflow CLI with branch creation, rebase, commit, and squash helpers"
  homepage "https://github.com/siwdie/gith"
  version "1.7.0"
  license "MIT"

  on_arm do
    url "https://github.com/siwdie/gith/releases/download/v1.7.0/gith-v1.7.0-macos-arm64"
    sha256 "65a50a72597c02ff7ca5aae8f7e53adb64882f2f4f7630f306a7fe392097cf3a"
  end

  def install
    odie "gith is currently available only for Apple Silicon (arm64)." unless Hardware::CPU.arm?

    bin.install "gith-v1.7.0-macos-arm64" => "gith"
  end

  test do
    system "#{bin}/gith", "--version"
  end
end

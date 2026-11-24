# MovieZen-TUI formula. The version and the SHA-256 digests below are rewritten
# by .github/workflows/manifests.yml every time a MovieZen release is published;
# they stay empty until the first MovieZen release exists.
class MoviezenTui < Formula
  VERSION = "0.1.30"
  MACOS_SHA256 = ""
  LINUX_X64_SHA256 = ""
  LINUX_ARM64_SHA256 = ""

  desc "Stream movies, shows, anime, and live TV from your terminal"
  homepage "https://github.com/sufiyan-sabeel/MovieZen-TUI"
  version VERSION
  license any_of: ["MIT", "Apache-2.0"]

  on_macos do
    url "https://github.com/sufiyan-sabeel/MovieZen-TUI/releases/download/v#{VERSION}/MovieZen_macOS_Universal.tar.gz"
    sha256 MACOS_SHA256
  end

  on_linux do
    if Hardware::CPU.arm?
      url "https://github.com/sufiyan-sabeel/MovieZen-TUI/releases/download/v#{VERSION}/MovieZen_Linux_arm64.tar.gz"
      sha256 LINUX_ARM64_SHA256
    else
      url "https://github.com/sufiyan-sabeel/MovieZen-TUI/releases/download/v#{VERSION}/MovieZen_Linux_x64.tar.gz"
      sha256 LINUX_X64_SHA256
    end
  end

  def install
    bin.install "moviezen"
    bin.install_symlink "moviezen" => "moviezen-tui"
  end

  test do
    system "#{bin}/moviezen", "--version"
  end
end

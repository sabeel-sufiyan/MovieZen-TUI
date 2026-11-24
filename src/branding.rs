//! MovieZen-TUI identity: names, tagline and the terminal wordmarks.
//!
//! Every line of [`LOGO_FULL`] is exactly [`LOGO_FULL_WIDTH`] cells wide and
//! every line of [`LOGO_COMPACT`] is exactly [`LOGO_COMPACT_WIDTH`] cells wide,
//! so the art stays aligned in any terminal that renders box-drawing glyphs.
//! [`LOGO_ASCII`] is the plain-ASCII fallback for terminals without Unicode.

/// Product name.
pub const NAME: &str = "MovieZen-TUI";

/// Primary command installed by every distribution channel.
pub const BIN_NAME: &str = "moviezen";

/// Secondary command alias offered by the npm wrapper and the installers.
pub const ALIAS_BIN_NAME: &str = "moviezen-tui";

/// Official tagline.
pub const TAGLINE: &str = "Your Terminal. Your Cinema. Your Zen.";

/// One-line product description.
pub const DESCRIPTION: &str =
    "A modern, keyboard-first terminal media interface with cross-platform support.";

/// Creator credit.
pub const CREATOR: &str = "Umaiz Sufiyan";

/// Project home.
pub const HOMEPAGE: &str = "https://github.com/sabeel-sufiyan/MovieZen-TUI";

/// Display width of [`LOGO_FULL`] in terminal cells.
pub const LOGO_FULL_WIDTH: u16 = 66;

/// Display width of [`LOGO_COMPACT`] in terminal cells.
pub const LOGO_COMPACT_WIDTH: u16 = 31;

/// Display width of [`LOGO_ASCII`] in terminal cells.
pub const LOGO_ASCII_WIDTH: u16 = 31;

/// Height of the full wordmark in rows.
pub const LOGO_FULL_HEIGHT: u16 = 6;

/// Height of the compact wordmark in rows.
pub const LOGO_COMPACT_HEIGHT: u16 = 2;

/// Full six-row wordmark for terminals at least [`LOGO_FULL_WIDTH`] wide.
pub const LOGO_FULL: &str = "\
███╗   ███╗ ██████╗ ██╗   ██╗██╗███████╗███████╗███████╗███╗   ██╗
████╗ ████║██╔═══██╗██║   ██║██║██╔════╝╚══███╔╝██╔════╝████╗  ██║
██╔████╔██║██║   ██║██║   ██║██║█████╗    ███╔╝ █████╗  ██╔██╗ ██║
██║╚██╔╝██║██║   ██║╚██╗ ██╔╝██║██╔══╝   ███╔╝  ██╔══╝  ██║╚██╗██║
██║ ╚═╝ ██║╚██████╔╝ ╚████╔╝ ██║███████╗███████╗███████╗██║ ╚████║
╚═╝     ╚═╝ ╚═════╝   ╚═══╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═══╝";

/// Two-row wordmark for narrow terminals.
pub const LOGO_COMPACT: &str = "\
█▀▄▀█ █▀█ █ █ █ █▀▀ ▀█ █▀▀ █▄ █
█ ▀ █ █▄█ ▀▄▀ █ ██▄ █▄ ██▄ █ ▀█";

/// Plain-ASCII fallback, centred inside [`LOGO_ASCII_WIDTH`] cells.
pub const LOGO_ASCII: &str = "         MOVIEZEN-TUI          ";

/// Two-row installer wordmark ("MOVIEZEN TUI"), exactly 44 cells wide.
pub const LOGO_INSTALLER: &str = "\
█▀▄▀█ █▀█ █ █ █ █▀▀ ▀█ █▀▀ █▄ █    ▀█▀ █ █ █
█ ▀ █ █▄█ ▀▄▀ █ ██▄ █▄ ██▄ █ ▀█ ▀▀  █  █▄█ █";

/// Width of [`LOGO_INSTALLER`] in terminal cells.
pub const LOGO_INSTALLER_WIDTH: u16 = 44;

/// Whether the terminal is expected to render the Unicode wordmarks.
///
/// `MOVIEZEN_ASCII_LOGO=1` forces the ASCII fallback; a dumb terminal implies
/// it as well. Everything else keeps the Unicode art.
pub fn supports_unicode_art() -> bool {
    if std::env::var_os("MOVIEZEN_ASCII_LOGO").is_some() {
        return false;
    }
    !matches!(
        std::env::var("TERM").unwrap_or_default().as_str(),
        "dumb" | "unknown"
    )
}

/// Wordmark for the landing screen, plus its display width.
///
/// `basic` is the caller's own "this terminal cannot be trusted with fancy
/// output" signal (no graphics protocol, no colour, tiny viewport).
pub fn wordmark(basic: bool) -> (&'static str, u16) {
    if basic || !supports_unicode_art() {
        if supports_unicode_art() {
            (LOGO_COMPACT, LOGO_COMPACT_WIDTH)
        } else {
            (LOGO_ASCII, LOGO_ASCII_WIDTH)
        }
    } else {
        (LOGO_FULL, LOGO_FULL_WIDTH)
    }
}

/// Full banner used by `moviezen --logo`: wordmark, name and tagline.
pub fn banner() -> String {
    let art = if supports_unicode_art() {
        LOGO_FULL
    } else {
        LOGO_ASCII
    };
    format!("{art}\n\n{NAME} — {TAGLINE}\n{CREATOR}\n")
}

#[cfg(test)]
mod tests {
    use super::*;
    use unicode_width::UnicodeWidthStr;

    #[test]
    fn full_wordmark_lines_are_aligned() {
        let lines: Vec<&str> = LOGO_FULL.lines().collect();
        assert_eq!(lines.len(), LOGO_FULL_HEIGHT as usize);
        for line in lines {
            assert_eq!(line.width(), LOGO_FULL_WIDTH as usize, "line: {line:?}");
        }
    }

    #[test]
    fn compact_wordmark_lines_are_aligned() {
        let lines: Vec<&str> = LOGO_COMPACT.lines().collect();
        assert_eq!(lines.len(), LOGO_COMPACT_HEIGHT as usize);
        for line in lines {
            assert_eq!(line.width(), LOGO_COMPACT_WIDTH as usize, "line: {line:?}");
        }
    }

    #[test]
    fn installer_wordmark_lines_are_aligned() {
        for line in LOGO_INSTALLER.lines() {
            assert_eq!(
                line.width(),
                LOGO_INSTALLER_WIDTH as usize,
                "line: {line:?}"
            );
        }
    }

    #[test]
    fn ascii_fallback_matches_compact_width() {
        assert_eq!(LOGO_ASCII.width(), LOGO_ASCII_WIDTH as usize);
    }
}

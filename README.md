# ZNotes

> Modern, cross-platform notes, checklists & day planner — offline-first, fully native.

**[⬇ Download from zsync.eu/znotes](https://zsync.eu/znotes/)** · [Source](https://github.com/TheHolyOneZ/ZNotes) · GPL v3.0

---

## What it does

- **Notes** — rich text notes with tags, colors, pinning, and reminders
- **Checklists** — task lists with per-item priority, categories, tags, scheduled dates, and reminders
- **Day Planner** — calendar view of all your scheduled checklists
- **Reminders** — fire through your OS notification center even when the app is minimized or hidden to tray
- **System Tray** — close to tray, keep running in the background, reminders still fire
- **Dark glass UI** — fully themed, customizable accent color, border radius, font size
- **100% offline** — no account, no cloud, no telemetry. SQLite on your machine.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| State | Zustand |
| Animation | Framer Motion |
| Desktop shell | Tauri v2 |
| Backend | Rust |
| Database | SQLite (rusqlite) |
| Notifications | notify-rust (Linux) · tauri-plugin-notification (Windows/macOS) |

---

## Download (prebuilt)

**Get the installer for your OS at [zsync.eu/znotes](https://zsync.eu/znotes/) — no build required.**

| Platform | Format |
|---|---|
| Windows 10/11 | `.exe` (NSIS installer) · `.msi` |
| macOS Intel | `.dmg` (x86_64) |
| macOS Apple Silicon | `.dmg` (aarch64) |
| Debian / Ubuntu | `.deb` |
| Fedora / RHEL | `.rpm` |
| Any Linux | `.AppImage` |

---

## Build from source

### Prerequisites

- [Node.js 20+](https://nodejs.org/) + [pnpm](https://pnpm.io/)
- [Rust (stable)](https://rustup.rs/)
- **Linux only:** system libraries

```bash
sudo apt-get install -y \
  libwebkit2gtk-4.1-dev libayatana-appindicator3-dev \
  librsvg2-dev libssl-dev libdbus-1-dev pkg-config
```

### Run in dev mode

```bash
git clone https://github.com/TheHolyOneZ/ZNotes.git
cd ZNotes/znotes
pnpm install
pnpm tauri dev
```

### Build release

```bash
pnpm tauri build
```

Outputs land in `src-tauri/target/release/bundle/`.

To target a specific bundle format:

```bash
pnpm tauri build --bundles deb,appimage   # Linux
pnpm tauri build --bundles nsis,msi       # Windows
pnpm tauri build --bundles dmg            # macOS
```

---

## Author

Made by **[TheHolyOneZ](https://github.com/theholyonez)** · [zsync.eu](https://zsync.eu)

---

## License

[GPL v3.0](https://www.gnu.org/licenses/gpl-3.0.html) © TheHolyOneZ

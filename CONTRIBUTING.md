# Contributing to Blacklight

Bug reports, fixes, translations and features are all welcome. Blacklight is a
small project — if something is broken or awkward, saying so is already useful.

## Before you start

- **Bugs**: open an [issue](https://github.com/isamarin/blacklight/issues). If it is a
  streaming problem, press `~` during the stream and include the debug statistics —
  that panel exists precisely so reports can be diagnosed.
- **Features**: open an issue first. It costs you nothing and saves you writing code
  that does not fit where the project is going.
- **Translations**: locale files live in
  `packages/desktop-tauri/src/lib/languages/`. Copy `en-US.json`, translate the
  values, leave the keys alone.

## Working on the code

```bash
pnpm install
pnpm desktop-tauri tauri:dev     # the desktop app
make web-all                     # API + UI in a browser, hot reload
```

Before opening a pull request:

```bash
pnpm lint
pnpm test
pnpm check:tauri
```

Two house rules that are easy to miss:

- Tabs for indentation in `desktop-tauri` and `pages`.
- Colours and blur come from the appearance tokens (`--color-accent`,
  `--glass-blur`), never hard-coded values — a literal silently opts out of
  Settings → Appearance.

If your change is visual, include a screenshot of it running. "The code looks right"
is not the same as "the screen looks right", and this project has been bitten by the
difference.

## Developer Certificate of Origin

There is no CLA here, and no copyright assignment. Blacklight is AGPL-3.0 and stays
that way — no commercial licence is sold, so there is nothing your contribution
needs to be re-licensed for. You keep your copyright; your code is AGPL like the
rest.

What is asked is a sign-off certifying you have the right to send it. This is the
[Developer Certificate of Origin 1.1](https://developercertificate.org/), the same
one the Linux kernel uses. By signing off you certify that the contribution is your
own work, or is based on work covered by a compatible open source licence that you
have the right to submit, and that you understand it will be recorded publicly and
redistributed under the AGPL.

Add the line with `git commit -s`:

```
Signed-off-by: Your Name <you@example.com>
```

That is the entire process. If your employer has rights to work you do, make sure
you have their permission before contributing.

## Questions

Licensing or anything else: <mako.mmw@gmail.com>.

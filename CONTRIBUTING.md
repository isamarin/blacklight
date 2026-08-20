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

## Contributor Licence Agreement

Blacklight is dual-licensed: AGPL-3.0 for everyone, plus a commercial licence for
those who cannot open their source. That second half only works if one person holds
the rights to the whole codebase — otherwise there is nothing to license.

So, by submitting a contribution you agree that:

1. You wrote the contribution yourself, or otherwise have the right to submit it
   under these terms, and it does not knowingly infringe anyone's rights.
2. You grant Igor Samarin a perpetual, worldwide, irrevocable, royalty-free licence
   to use, reproduce, modify, sublicense and distribute your contribution, including
   the right to license it under terms other than the AGPL — for example as part of a
   commercial licence.
3. You keep your own copyright. This is a licence you grant, not an assignment: you
   may continue to use your contribution however you like, elsewhere.
4. Your contribution is provided as-is, with no warranty of any kind.

If your employer has rights to work you do, make sure you have their permission
before contributing.

State your agreement in the pull request description:

```
I have read CONTRIBUTING.md and I agree to the CLA.
```

If you would rather not grant that licence, that is a legitimate position — open an
issue describing the change instead, and it can be implemented separately.

## Questions

Licensing or anything else: <mako.mmw@gmail.com>.

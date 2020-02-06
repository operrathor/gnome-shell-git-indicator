# Git indicator

## Screenshots

Clean working tree, nothing to commit:

![Indicating that the working tree is clean and there's nothing to commit](screenshots/clean.png)

Local changes:

![Indicating that there are local changes](screenshots/changes.png)

## Installation

```sh
git clone https://github.com/operrathor/gnome-shell-git-indicator.git ~/.local/share/gnome-shell/extensions/git-indicator@operrathor.net
```

Afterwards, enable the extension via `gnome-shell-extension-prefs` or Tweaks.

## Configuration

Set `REPOSITORY_PATH` in `extension.js` and restart Gnome Shell.

## How it works

If the output of `git status -s` is empty, the working tree seems to be clean and there's obviously nothing to commit.

## Limitations

* Limited to only one local Git repository
* Repository path is hardcoded, nonconfigurable
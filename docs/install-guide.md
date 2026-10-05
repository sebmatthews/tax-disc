# Install Guide

Status: draft, 5 October 2026. Written for presenters setting up a Mac to run the Tax Disc demo. In the demo, an AI coding agent rewrites an old green screen system as a modern web page, and a check proves the two give the same answers. Facts about outside products are labelled confirmed (with where and when they were checked), or unconfirmed.

## What You Need

A Mac with an Apple silicon chip (M1 or later), an internet connection for the setup, and about half an hour. You do not need to be an engineer. Every command below is typed, or pasted, into the Terminal app exactly as shown.

Everything in the demo runs on your Mac. You need no GitHub account to run it, no cloud account, and no Windows.

## Step 1: Install Homebrew

Homebrew installs the other tools the demo needs. Open Terminal and paste:

    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

It explains what it will do and pauses before doing it. It may ask for your Mac's password; type it and press Enter (nothing appears as you type). When it finishes, it may print two or three commands under 'Next steps' to add Homebrew to your path. Paste and run them, then close Terminal and open it again. Unconfirmed: brew.sh does not describe these 'Next steps'.

Confirmed: the install command, and that it pauses to explain before acting (brew.sh, read 5 October 2026). brew.sh lists macOS Sequoia (15) and newer as supported. Unconfirmed: whether older versions of macOS still work.

## Step 2: Install GnuCOBOL, Node and Git

GnuCOBOL runs the old system. Node runs the new one. Git downloads the demo.

    brew install gnucobol node git

Confirmed: Homebrew's GnuCOBOL is version 3.2, with ready-built packages for Apple silicon Macs (formulae.brew.sh/formula/gnucobol, read 5 October 2026). Homebrew's Node is version 26.10.0 (formulae.brew.sh/formula/node, read 5 October 2026), which runs the demo's TypeScript directly, with nothing else to install (nodejs.org/api/typescript.html, read 5 October 2026).

## Step 3: Install and Sign In to Cosine CLI

Cosine CLI is the AI coding agent the audience watches.

Use the same version of Cosine, and the same model setup, that the demo was rehearsed with; the demo's owner tells you which. Not decided yet. The public version, called `cos`, is described below.

    brew install CosineAI/tap/cos
    cos login

`cos login` opens a browser page to sign in to your Cosine account, then shows a success page; switch back to Terminal.

Confirmed: the Homebrew install command and `cos login` (cosine.sh/docs/cli/install-and-authenticate-the-cli, read 5 October 2026). Unconfirmed: Cosine's minimum macOS version, which its documentation does not state.

For reference, if the model setup is a Claude subscription: Cosine can use a Claude Pro, Max, Team or Enterprise plan that includes Claude Code. You install Claude Code, run `claude` once and sign in, then start Cosine with `cos` from the same Terminal, type `/model` and choose one of the 'Claude Subscription' models. Confirmed (cosine.sh/docs/cli/login-with-claude, read 5 October 2026).

## Step 4: Download the Demo

In Terminal:

    git clone --depth 1 --single-branch --branch main https://github.com/OWNER/tax-disc.git

Type it exactly as shown. The extra words download only the current version of the demo, without its history or other branches, which the AI agent must not be able to see. Replace OWNER with the GitHub account or organisation that holds the demo, as given to you by the demo's owner. This makes a folder called tax-disc in your home folder. Whenever you run the demo, open Terminal and go into it first with `cd tax-disc`.

## Step 5: Check Everything Is Ready

Not built yet: a demo command will check each step above and say whether this Mac is ready. Until then, in the tax-disc folder:

    sh legacy/build.sh
    ./legacy/vedenq

The green screen should appear. Press Escape to leave it.

## If Something Goes Wrong

Write down the exact message Terminal shows and send it to the demo's owner. Do not try other commands you find online; the demo depends on every Mac being set up the same way.

## Where These Facts Come From

- Homebrew install: https://brew.sh, read 5 October 2026
- GnuCOBOL on Homebrew: https://formulae.brew.sh/formula/gnucobol, read 5 October 2026
- Node on Homebrew: https://formulae.brew.sh/formula/node, read 5 October 2026
- Node running TypeScript: https://nodejs.org/api/typescript.html, read 5 October 2026
- Cosine CLI install and sign-in: https://cosine.sh/docs/cli/install-and-authenticate-the-cli, read 5 October 2026
- Cosine with a Claude subscription: https://cosine.sh/docs/cli/login-with-claude, read 5 October 2026

# Install Guide

Version 1.0, 6 October 2026. Written for presenters setting up a Mac to run the Tax Disc demo. In the demo, an AI coding agent rewrites an old green screen system as a modern web page, and a check proves the two give the same answers. Facts about outside products are labelled confirmed (with where and when they were checked), or unconfirmed.

## What You Need

A Mac with an Apple silicon chip (M1 or later), an internet connection for the setup, and about half an hour. You do not need to be an engineer. Every command below is typed, or pasted, into the Terminal app exactly as shown.

Everything in the demo runs on your Mac. You need no cloud account and no Windows. If the demo's repository on GitHub is public, you need no GitHub account either; if it is private, the demo's owner gives your GitHub account access, and you sign Git in to GitHub before Step 5: run `brew install gh`, then `gh auth login`, and choose GitHub.com, then HTTPS, then yes to signing in to Git with your GitHub credentials, then logging in with a web browser.

## Step 1: Install Homebrew

Homebrew installs the other tools the demo needs. Open Terminal and paste:

    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

It explains what it will do and pauses before doing it. It may ask for your Mac's password; type it and press Enter (nothing appears as you type). When it finishes, it prints two or three commands under 'Next steps' to add Homebrew to your path. Paste and run them, then close Terminal and open it again; without them, Homebrew will not work.

Confirmed: the install command, and that it pauses to explain before acting (brew.sh, read 5 October 2026); the 'Next steps' directions, and that macOS 15 (Sequoia) and newer are supported while macOS 11 to 14 are unsupported but may work (docs.brew.sh/Installation, checked 6 October 2026). On macOS 14 and older, Homebrew may have to build Node from source, which is slow.

## Step 2: Install GnuCOBOL, Node and Git

GnuCOBOL runs the old system. Node runs the new one. Git downloads the demo.

    brew install gnucobol node git

Confirmed: Homebrew's GnuCOBOL is version 3.2, with ready-built packages for Apple silicon Macs (formulae.brew.sh/formula/gnucobol, read 5 October 2026). Homebrew's Node is version 26.10.0 (formulae.brew.sh/formula/node, read 5 October 2026), which runs the demo's TypeScript directly, with nothing else to install (nodejs.org/api/typescript.html, read 5 October 2026).

## Step 3: Install and Sign In to Cosine CLI

Cosine CLI is the AI coding agent the audience watches.

Use the same version of Cosine, and the same model, as the demo's owner tells you, and the same for every presenter, so the demo behaves the same way each time. For reference: the demo was run successfully on 6 October 2026 with Cosine's Outpost model, which took about seven minutes; the demo's author expects other models to do better. The public version of Cosine, called `cos`, is described below.

    brew install CosineAI/tap/cos
    cos login

`cos login` opens a browser page to sign in to your Cosine account, then shows a success page; switch back to Terminal.

Confirmed: the Homebrew install command and `cos login` (cosine.sh/docs/cli/install-and-authenticate-the-cli, read 5 October 2026). That page also says a Cosine account and 'a GitHub project imported to your team' are needed 'to fully utilise the CLI'. Unconfirmed: whether that is needed for the demo, which was run without one; and Cosine's minimum macOS version, which its documentation does not state.

For reference, if the model setup is a Claude subscription: Cosine can use a Claude Pro, Max, Team or Enterprise plan that includes Claude Code. You install Claude Code, run `claude` once and sign in, then start Cosine with `cos` from the same Terminal, type `/model` and choose one of the 'Claude Subscription' models. Confirmed (cosine.sh/docs/cli/login-with-claude, read 5 October 2026).

## Step 4: Tell Git Your Name

The demo keeps each run's work on your Mac, and Git records a name and email against it. They stay on your Mac; any name and email will do:

    git config --global user.name "Your Name"
    git config --global user.email "you@example.com"

## Step 5: Download the Demo

In Terminal:

    git clone --depth 1 --single-branch --branch main https://github.com/OWNER/tax-disc.git ~/tax-disc

Type it exactly as shown. The extra words download only the current version of the demo, without its history or other branches, which the AI agent must not be able to see. Replace OWNER with the GitHub account or organisation that holds the demo, as given to you by the demo's owner. This makes a folder called tax-disc in your home folder. Whenever you run the demo, open Terminal and go into it first with `cd ~/tax-disc`.

If the download says the folder already exists, an earlier copy is still there. Never run the demo in a copy you did not get this way: an agent working in it may find earlier work. Delete it, then download again:

    cd ~
    rm -rf ~/tax-disc

## Step 6: Check Everything Is Ready

In the tax-disc folder:

    ./demo.sh check

It checks each of the steps above and says 'This Mac is ready', or names the step to go back to. It changes nothing in the demo.

## If Something Goes Wrong

Write down the exact message Terminal shows and send it to the demo's owner. Do not try other commands you find online; the demo depends on every Mac being set up the same way.

## Where These Facts Come From

- Homebrew install: https://brew.sh, read 5 October 2026, and https://docs.brew.sh/Installation, checked 6 October 2026
- GnuCOBOL on Homebrew: https://formulae.brew.sh/formula/gnucobol, read 5 October 2026
- Node on Homebrew: https://formulae.brew.sh/formula/node, read 5 October 2026
- Node running TypeScript: https://nodejs.org/api/typescript.html, read 5 October 2026
- Cosine CLI install and sign-in: https://cosine.sh/docs/cli/install-and-authenticate-the-cli, read 5 October 2026
- Cosine with a Claude subscription: https://cosine.sh/docs/cli/login-with-claude, read 5 October 2026

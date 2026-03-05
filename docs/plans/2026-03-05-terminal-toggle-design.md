# Designer/Dev Mode Toggle + Interactive Terminal — Design Document

## Overview

Add a Figma-style toggle that switches the entire portfolio homepage between "Designer Mode" (current visual portfolio) and "Dev Mode" (a full-screen interactive terminal). The terminal supports real commands that display portfolio data in CLI format, plus fun easter-egg commands.

## Architecture

`ViewModeProvider` context wraps the public layout. Holds mode state (`"designer" | "dev"`) and terminal session state (history, output). Homepage conditionally renders either existing sections or `InteractiveTerminal`. A `ViewModeToggle` pill is fixed at bottom-center.

### File Structure

```
src/app/components/view-mode/
  ViewModeContext.ts            # Context + useViewMode hook
  ViewModeProvider.tsx          # Provider with mode + terminal session state
  ViewModeToggle.tsx            # Fixed bottom-center Figma-style pill
  InteractiveTerminal.tsx       # Full-screen terminal UI
  hooks/
    useTerminal.ts              # Command execution, history navigation, autocomplete
  commands/
    registry.ts                 # Command map, lookup, help generation
    commands.ts                 # All command implementations (pure functions)
    index.ts                    # Re-exports
  __tests__/
    commands.test.ts            # Unit tests for command functions
    useTerminal.test.ts         # Hook logic tests
    registry.test.ts            # Registry tests
```

### Integration Points

- Public layout: wrap with `ViewModeProvider` (inside existing `EasterEggsProvider`)
- Homepage `page.tsx`: conditional render based on mode
- Footer: hidden in dev mode
- Header: stays visible in both modes
- Toggle pill: rendered by provider, visible only on homepage

## Toggle Pill

Fixed at `bottom-center`. Pill shape with two segments: design icon (paintbrush/pen) and code icon (`</>` or terminal). Active segment has accent-cyan background with sliding indicator animation. Persists choice in `localStorage`.

## Terminal Behavior

- Full viewport height below header
- Prompt: `visitor@youssef:~$`
- Blinking cursor at input line
- Enter executes, output renders below
- Auto-scrolls to bottom on new output
- Up/Down arrows cycle command history
- Tab autocompletes command names
- Session state persists across toggles (lives in provider)
- Welcome message on first render with instructions

## Commands

### Portfolio Commands

| Command | Output |
|---------|--------|
| `help` | Lists all commands with descriptions |
| `whoami` | `Youssef Nesafe — Senior Frontend Engineer` |
| `about` | About text from dictionary |
| `experience` | Formatted career timeline |
| `projects` | Project list with titles, types, tech |
| `skills` | Tech stack grouped by category |
| `contact` | Contact info |
| `ls` | Lists "files": about.txt, experience.log, projects/, skills.json, contact.md, resume.pdf |
| `history` | Numbered command history |
| `clear` | Clears terminal output |

### Action Commands

| Command | Output |
|---------|--------|
| `sudo hire-me` | Fun message + opens mailto link |
| `cat resume.pdf` | Triggers download of /pdf/cv.pdf |
| `theme [cyan\|purple\|emerald]` | Changes site accent color |

### Fun Commands

| Command | Output |
|---------|--------|
| `sudo rm -rf /` | `Nice try. Permission denied. This portfolio is indestructible.` |
| `coffee` | ASCII coffee cup + brew error |
| `matrix` | Triggers Matrix rain (reuses easter egg) |
| `neofetch` | Fake system info: OS, Shell, Terminal, Uptime, etc. |
| `ping google.com` | Joke redirect to `ping youssef` |
| `ping youssef` | `Reply from Youssef: I'm available! Latency: 0ms` |
| `exit` | `There is no escape... just kidding. But hire me first?` |
| `date` | Current date + years-coding fun fact |
| `echo [text]` | Echoes back input |
| (unknown) | `command not found: <cmd>. Type 'help' for available commands.` |

## Data Flow

Commands are pure functions: `(args: string[], context: CommandContext) => OutputLine[]`. Context provides dictionary data and callbacks (triggerMatrix, openMailto, downloadResume). Easy to test without DOM.

## Testing Plan

- Commands: unit test each — pure input/output
- useTerminal: test execution, history up/down, unknown command, clear
- Registry: test help output, command lookup
- Toggle: localStorage persistence

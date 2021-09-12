# Changelog

All notable changes to this project will be documented in this file.

## v7.1 (2021-09-12)

- Fixed issue with simple LESS check regarding at-rules and style variables
- Fixed issue where Monaco editor wouldn't load properly anymore in Mobirise 4 (due to a minimized Monaco file, don't ask)

## v7 (2021-08-31)

- Fixed issue where a global block's name would get a longer name after each edit
- Fixed issue with editing a footer block, sometimes it would open the wrong block
- Fixed issue with editing a menu block, if said block wasn't on top
- Updated Monaco Editor to v0.27.0
- Added check if used LESS variables are present in `<mbr-parameters>`

## v6 (2020-10-25)

- Fixed issue with editing/creating global blocks

## v5 (2020-10-03)

- Fixed issue where you couldn't properly edit/select a footer if it had the 'always-bottom' attribute
- Added feature to make blocks global (by adding the 'global' attribute to the section), block then gets added to all pages
- Can now also edit blocks that are global, changes get pushed to all other instances of a block

## v4 (2020-06-06)

- Added check if current theme is a 'primary' theme (M/M3), in which case the Code Editor is not available
- Improved handling of asynchronous 'objectifyCSS' function. Its behaviour changed in v5.0.7, but this should've been handled better already anyway
- Improved PHP when used as attributes inside HTML elements
- Added notification if a PHP conversion error was detected. This error sometimes happens, but haven't found a way to reproduce it yet

## v3 (2020-03-14)

- Fixed compatibility with Mobirise v5
- Replaced CodeMirror with Monaco Editor, including three themes (Visual Studio, Visual Studio Dark and High Contrast Black)
- Added button to toggle word wrap
- Added better support for Javascript code; it gets replaced with [JS_CODE_x], so it isn't active inside Mobirise

## v2 (2019-12-29)

- Added new block for custom HTML that can be edited with the editor
- Added search and replace functionality
- Added JSON to CSS translator, so you can simply edit (or paste) CSS instead of JSON
- Added GitHub Actions CI pipeline to automatically generate mbrext files
- Removed the "fix" for PHP code getting distorted, as it was no issue with this extension. The fix also wasn't working properly anyway
- Added better support for PHP code

## 0.4 (2019-04-04)

- Added PHP support, meaning Mobirise will no longer comment out PHP code, but just leave it be. Happy coding!
- Added PHP syntax highlighting to the HTML editor

## 0.3 (2019-03-31)

- Added an internal index of components. This fixes an issue where you thought you were editing the anchor of block A, but you were actually editing block B. That happened when the menu component is (technically) not the first one of the page. With this internal index, this is no longer an issue.
- Fixed an issue where if you edited a section, it would always load "index.html" afterwards

## 0.2 (2019-03-31)

- Added side-by-side editors, one for HTML, one for CSS
- Updated the way the Javascript libraries are loaded. This solves the bug where code highlighting didn't always work, or active line didn't show, etc.
- Added check if a block's "_customHTML" is available. If it isn't, the user receives a warning that the editor can't be used to edit said block
- Added "edit" icon to each block
- Removed "editor" icon from Mobirise navbar
- Removed bunch of (now) unused coding

## 0.1 (unreleased)

This is the initial release of the Code Editor extension for Mobirise, forked from DeltaPi's Code Editor.
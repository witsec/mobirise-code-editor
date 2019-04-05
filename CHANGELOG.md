# Changelog

All notable changes to this project will be documented in this file.

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
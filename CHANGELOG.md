# Changelog

## [1.3.0] - 2024-01-12

### Added

- NPM API integration to check the relevance of the application version.
- Displaying the application version for the user. CLI and HTML.

### Fixed

- DOTABUFF/games in which a hero is not selected are not counted.
- OPENDOTA/checking game modes when calculating player records (Custom modes, games with bots, and other seasonal or unpopular modes are excluded).
- OPENDOTA/checking match duration when calculating player records (Matches that last less than 7.5 minutes will be excluded. To eliminate the possibility of unfair gaming indicators).
- The error page has been changed and adapted to high resolution.

### Changed

- Changing the architecture and order of error handling.

## [1.2.0] - 2024-01-07

### Added

- Saving a player to a configuration file via application interaction.
- Cross-platform display of configuration file location.
- Shortcut-icon in html.
- Validating arguments before starting the service.

### Fixed

- Displaying images of heroes/items.

### Changed

- Documentation (README.md) updated.

## [1.1.0] - 2024-01-04

### Added

- The configuration file - `config.json`.
- Ability to select a player from a previously filled list in the configuration file, when launching the application without arguments.
- Port can be set in the configuration file.

### Changed

- The time for automatically closing the application has been raised (10s -> 15s).
- Animations in tables.
- Documentation (```README.md```) updated.

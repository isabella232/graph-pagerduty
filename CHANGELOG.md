# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed

- Migrated to latest integration SDK for improved error handling and reporting.

- Relationships
  - `User - ONCALL -> Service` has been changed to `User - MONITORS -> Service`.
    Relationships are best expressed as verbs, and `MONITORS` is the preferred
    verb in this type of relationship.

### Fixed

- A number of type check errors after upgrading TypeScript

## 2.2.0 - 2021-03-19

### Added

- New Properties
  - `User`: `id`, `type`, `email`, `role`, `jobTitle`, `timeZone`, `billed`,
    `description`, `invitationSent`, `webLink`

## [1.0.6]

### Added

- Checking for PagerDuty Admins

## [1.0.5]

### Fixes

- Services active flag always being set to false

## [1.0.4]

### Fixes

- Duplicate relationships between PagerDuty entities

## [1.0.2]

Initial Release

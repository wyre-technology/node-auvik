# [1.1.0](https://github.com/wyre-technology/node-auvik/compare/v1.0.0...v1.1.0) (2026-06-15)


### Features

* add support for us5 Auvik API region ([#12](https://github.com/wyre-technology/node-auvik/issues/12)) ([ed52b6c](https://github.com/wyre-technology/node-auvik/commit/ed52b6c3d7f07d3cc221fe22b3f07baedc69d5ec))

# 1.0.0 (2026-05-21)


### Features

* initial release of @wyre-technology/node-auvik ([74d83f8](https://github.com/wyre-technology/node-auvik/commit/74d83f877b36197da791f158fd9e93fbe33aef1b))

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Support for the `us5` Auvik API region (`auvikapi.us5.my.auvik.com`). Added to the `AuvikRegion` type and the auto-resolution probe list so credentials on the US5 cluster resolve correctly.

## [0.1.0] - 2026-05-21

### Added
- Initial release of @wyre-technology/node-auvik
- Support for all major Auvik API endpoints:
  - Tenant management
  - Device inventory (info, details, warranty, lifecycle)
  - Network inventory (info, details)
  - Interface inventory
  - Configuration management
  - Entity notes and audits
  - Component information
  - Alert history and dismissal
  - Statistics (device, interface, service, component, SNMP poller)
  - Billing usage reports
- Automatic region detection with caching
- Built-in retry logic with exponential backoff
- Rate limiting protection
- TypeScript support with strict typing
- JSON:API response handling
- Pagination support with async iterators
- Comprehensive test coverage
- ESM and CommonJS module support

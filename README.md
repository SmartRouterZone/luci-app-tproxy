# luci-app-tproxy

[简体中文](README.zh-CN.md)

LuCI support for running mihomo with nftables TProxy rules on OpenWrt.

This package provides:

- A LuCI page under **Services > TProxy**
- A UCI config file at `/etc/config/tproxy`
- A procd init script at `/etc/init.d/tproxy`
- nftables TProxy rule generation
- IPv4 and IPv6 policy routing setup
- Kernel version display for the configured mihomo binary
- A LuCI log panel for recent tproxy, mihomo, and Clash.Meta log entries
- Simplified Chinese translation

## Requirements

The package depends on:

- `luci-base`
- `nftables`
- `kmod-nft-tproxy`
- `kmod-nft-socket`
- `ip-full`

You also need a working mihomo binary and config file. The default paths are:

```text
/usr/local/bin/mihomo
/etc/clash.meta/config.yaml
```

## Install In An OpenWrt Buildroot

Copy this directory into your OpenWrt source tree:

```text
package/luci-app-tproxy
```

Then select it in menuconfig:

```text
LuCI -> Applications -> luci-app-tproxy
```

Build it with your firmware or as a package:

```sh
make package/luci-app-tproxy/compile V=s
```

## Configuration

After installation, edit it from LuCI:

```text
Services -> TProxy
```

The important fields are:

- **Kernel path**: mihomo executable path
- **Firewall mark**: mark used for proxied traffic
- **Bypass mark**: mark used by mihomo/direct traffic to avoid loops
- **IPv4/IPv6 route table and rule priority**
- **Generated nft file**
- **TProxy port**
- **Listen interfaces**
- **Bypass interfaces**
- **Bypass ports**
- **TCP/UDP proxy ports**
- **Reserved IPv4/IPv6 bypass addresses**

Multiple values can be separated by commas, spaces, or new lines. For example:

```text
80, 443, 853
eth0, pppoe-wan, wg
```

## Runtime Behavior

When enabled, `/etc/init.d/tproxy` will:

1. Start mihomo through procd.
2. Add policy routing rules for marked traffic.
3. Generate an nftables ruleset at the configured `nft_file`.
4. Load the nftables ruleset.
5. Clean policy routes and nftables rules when stopped.

The default TProxy port is:

```text
12345
```

Make sure your mihomo configuration listens on the same TProxy port.

## Useful Commands

```sh
/etc/init.d/tproxy enable
/etc/init.d/tproxy start
/etc/init.d/tproxy stop
/etc/init.d/tproxy restart
/etc/init.d/tproxy core_version
/etc/init.d/tproxy logs
```

## Validation

Basic local checks:

```sh
sh -n root/etc/init.d/tproxy
node --check htdocs/luci-static/resources/view/tproxy/settings.js
msgfmt --check po/zh_Hans/tproxy.po
msgfmt --check po/templates/tproxy.pot
```

# luci-app-tproxy

[English](README.md)

这是一个用于 OpenWrt 的 LuCI 插件，用来通过 nftables TProxy 规则运行 mihomo 透明代理。

这个包提供：

- `服务 -> TProxy` LuCI 配置页面
- `/etc/config/tproxy` UCI 配置文件
- `/etc/init.d/tproxy` procd 服务脚本
- nftables TProxy 规则生成
- IPv4 / IPv6 策略路由设置
- 显示所配置 mihomo 内核的版本号
- 显示 tproxy、mihomo、Clash.Meta 相关日志
- 简体中文翻译

## 依赖

包依赖：

- `luci-base`
- `nftables`
- `kmod-nft-tproxy`
- `kmod-nft-socket`
- `ip-full`

你还需要准备可用的 mihomo 二进制和配置文件。默认路径是：

```text
/usr/local/bin/mihomo
/etc/clash.meta/config.yaml
```

## 在 OpenWrt 源码中安装

把本目录复制到 OpenWrt 源码树：

```text
package/luci-app-tproxy
```

然后在 menuconfig 中选择：

```text
LuCI -> Applications -> luci-app-tproxy
```

随固件编译，或单独编译包：

```sh
make package/luci-app-tproxy/compile V=s
```

## 配置

安装后在 LuCI 中打开：

```text
服务 -> TProxy
```

主要配置项包括：

- **内核路径**：mihomo 可执行文件路径
- **防火墙标记**：被透明代理流量使用的 mark
- **绕过标记**：mihomo 直连/绕过流量使用的 mark，用于避免回环
- **IPv4/IPv6 路由表和规则优先级**
- **生成的 nft 文件**
- **TProxy 端口**
- **监听接口(LAN接口)**
- **绕过接口**
- **绕过端口**
- **TCP/UDP 代理端口**
- **IPv4/IPv6 保留绕过地址**

多值配置支持逗号、空格或换行分隔，例如：

```text
80, 443, 853
eth0, pppoe-wan, wg
```

## 运行行为

启用后，`/etc/init.d/tproxy` 会：

1. 通过 procd 启动 mihomo。
2. 添加 marked 流量使用的策略路由。
3. 在配置的 `nft_file` 路径生成 nftables 规则。
4. 加载 nftables 规则。
5. 停止服务时清理策略路由和 nftables 规则。

默认 TProxy 端口是：

```text
12345
```

请确保 mihomo 配置中的 TProxy 监听端口与这里一致。

## 常用命令

```sh
/etc/init.d/tproxy enable
/etc/init.d/tproxy start
/etc/init.d/tproxy stop
/etc/init.d/tproxy restart
/etc/init.d/tproxy core_version
/etc/init.d/tproxy logs
```

## 检查

基础本地检查：

```sh
sh -n root/etc/init.d/tproxy
node --check htdocs/luci-static/resources/view/tproxy/settings.js
msgfmt --check po/zh_Hans/tproxy.po
msgfmt --check po/templates/tproxy.pot
```

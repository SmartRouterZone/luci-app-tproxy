include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-tproxy
PKG_VERSION:=1.0.0
PKG_RELEASE:=1

LUCI_TITLE:=LuCI support for nftables TProxy
LUCI_DEPENDS:=+luci-base +nftables +kmod-nft-tproxy +kmod-nft-socket +ip-full
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature

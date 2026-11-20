#!/usr/bin/env bash
# 红笔 · macOS 打包脚本（需在 macOS 上执行，Windows 无法交叉编译 macOS 应用）
#
#   ./installer/package_macos.sh
#
# 产物：dist/macos/红笔-1.0.0-macos.dmg
#
# 前置：
#   - Xcode 15+ 与命令行工具（xcode-select --install）
#   - Flutter 3.x（flutter doctor 中 macOS 一项通过）
#   - 若要分发给他人，需要在 Apple Developer 账号下做 codesign 与 notarize，
#     把证书名填到 CODESIGN_ID 环境变量；未签名时只能在本机运行。
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="红笔"
VERSION="1.0.0"
BUILD_DIR="$ROOT/client/build/macos/Build/Products/Release"
OUT_DIR="$ROOT/dist/macos"
CODESIGN_ID="${CODESIGN_ID:-}"

cd "$ROOT/client"
flutter pub get
flutter build macos --release

APP_PATH="$BUILD_DIR/red_pen.app"
if [[ ! -d "$APP_PATH" ]]; then
  echo "未找到 $APP_PATH，请确认 flutter build macos 成功" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
STAGE="$(mktemp -d)"
cp -R "$APP_PATH" "$STAGE/$APP_NAME.app"

if [[ -n "$CODESIGN_ID" ]]; then
  codesign --deep --force --options runtime --sign "$CODESIGN_ID" "$STAGE/$APP_NAME.app"
  xcrun notarytool submit "$STAGE/$APP_NAME.app" --keychain-profile redpen --wait || true
fi

hdiutil create -volname "$APP_NAME" -srcfolder "$STAGE" -ov -format UDZO \
  "$OUT_DIR/$APP_NAME-$VERSION-macos.dmg"
rm -rf "$STAGE"

echo "完成：$OUT_DIR/$APP_NAME-$VERSION-macos.dmg"
echo "提示：dmg 里的应用未做公证时，首次打开需要在“系统设置 → 隐私与安全性”里允许。"

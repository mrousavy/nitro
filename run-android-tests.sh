#!/usr/bin/env bash
# run-android-tests.sh
# Builds the Android app and runs the react-native-harness test suite.
# Usage: ./run-android-tests.sh [AVD_NAME] [API_LEVEL] [DEVICE_PROFILE]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXAMPLE_DIR="$SCRIPT_DIR/example"
ANDROID_DIR="$EXAMPLE_DIR/android"

# ─── Defaults (override via positional args or env vars) ───────────────────────
AVD_NAME="${1:-${AVD_NAME:-Pixel_8_API_35}}"
DEVICE_API_LEVEL="${2:-${DEVICE_API_LEVEL:-35}}"
DEVICE_PROFILE="${3:-${DEVICE_PROFILE:-pixel_8}}"

JAVA_HOME_OVERRIDE="${JAVA_HOME_OVERRIDE:-/usr/lib/jvm/java-17-temurin-jdk}"

# Detect architecture from the running emulator; fall back to x86_64
detect_abi() {
  local abi
  abi=$(adb shell getprop ro.product.cpu.abi 2>/dev/null | tr -d '\r')
  case "$abi" in
    arm64-v8a|armeabi-v7a|x86_64|x86) echo "$abi" ;;
    *) echo "x86_64" ;;
  esac
}

# ─── Check prerequisites ───────────────────────────────────────────────────────
echo "==> Checking prerequisites..."

if ! command -v adb &>/dev/null; then
  echo "ERROR: adb not found. Install Android SDK platform-tools." >&2
  exit 1
fi

if ! command -v npx &>/dev/null; then
  echo "ERROR: npx not found. Install Node.js." >&2
  exit 1
fi

if [ ! -d "$JAVA_HOME_OVERRIDE" ]; then
  echo "WARNING: Java 17 not found at $JAVA_HOME_OVERRIDE — using system Java (may fail)."
  JAVA_HOME_OVERRIDE=""
fi

# ─── Verify emulator is running ───────────────────────────────────────────────
echo "==> Checking for connected Android device/emulator..."
if ! adb devices | grep -q "device$"; then
  echo "ERROR: No device/emulator connected. Start an emulator first." >&2
  exit 1
fi

ABI=$(detect_abi)
echo "    Device ABI: $ABI"
echo "    AVD_NAME:   $AVD_NAME"
echo "    API_LEVEL:  $DEVICE_API_LEVEL"
echo "    PROFILE:    $DEVICE_PROFILE"

# ─── Build ────────────────────────────────────────────────────────────────────
echo ""
echo "==> Building Android app (arch: $ABI)..."

BUILD_ENV=()
if [ -n "$JAVA_HOME_OVERRIDE" ]; then
  BUILD_ENV+=(
    "JAVA_HOME=$JAVA_HOME_OVERRIDE"
    "PATH=$JAVA_HOME_OVERRIDE/bin:$PATH"
  )
fi

env "${BUILD_ENV[@]}" \
  "$ANDROID_DIR/gradlew" \
    -p "$ANDROID_DIR" \
    assembleDebug \
    --no-daemon \
    --console=plain \
    "-PreactNativeArchitectures=$ABI"

APK="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
if [ ! -f "$APK" ]; then
  echo "ERROR: APK not found at $APK" >&2
  exit 1
fi

# ─── Install ──────────────────────────────────────────────────────────────────
echo ""
echo "==> Installing APK on device..."
adb install -r "$APK"

# ─── Start Metro (if not already running) ─────────────────────────────────────
METRO_PORT=8081
if curl -sf "http://localhost:$METRO_PORT/status" &>/dev/null; then
  echo ""
  echo "==> Metro already running on port $METRO_PORT."
  METRO_PID=""
else
  echo ""
  echo "==> Starting Metro bundler..."
  cd "$EXAMPLE_DIR"
  npx react-native start --no-interactive &
  METRO_PID=$!

  echo "    Waiting for Metro to be ready..."
  for i in $(seq 1 30); do
    if curl -sf "http://localhost:$METRO_PORT/status" &>/dev/null; then
      echo "    Metro ready."
      break
    fi
    sleep 2
    if [ "$i" -eq 30 ]; then
      echo "ERROR: Metro did not start in time." >&2
      kill "$METRO_PID" 2>/dev/null || true
      exit 1
    fi
  done
fi

# ─── Run tests ────────────────────────────────────────────────────────────────
echo ""
echo "==> Running harness tests..."
cd "$EXAMPLE_DIR"

set +e
AVD_NAME="$AVD_NAME" \
DEVICE_API_LEVEL="$DEVICE_API_LEVEL" \
DEVICE_PROFILE="$DEVICE_PROFILE" \
  npx react-native-harness
TEST_EXIT=$?
set -e

# ─── Cleanup ──────────────────────────────────────────────────────────────────
if [ -n "${METRO_PID:-}" ]; then
  echo ""
  echo "==> Stopping Metro (PID $METRO_PID)..."
  kill "$METRO_PID" 2>/dev/null || true
fi

echo ""
if [ "$TEST_EXIT" -eq 0 ]; then
  echo "✅ All tests passed."
else
  echo "❌ Some tests failed (exit code $TEST_EXIT)."
fi

exit "$TEST_EXIT"

#include "window_state.h"

namespace {

constexpr const wchar_t kWindowStateKey[] = L"Software\\RedPen\\Window";

bool ReadDword(HKEY key, const wchar_t* name, DWORD* value) {
  DWORD size = sizeof(*value);
  return RegQueryValueExW(key, name, nullptr, nullptr,
                          reinterpret_cast<LPBYTE>(value),
                          &size) == ERROR_SUCCESS;
}

void WriteDword(HKEY key, const wchar_t* name, DWORD value) {
  RegSetValueExW(key, name, 0, REG_DWORD,
                 reinterpret_cast<const BYTE*>(&value), sizeof(value));
}

}  // namespace

std::optional<WindowState> LoadWindowState() {
  HKEY key = nullptr;
  if (RegOpenKeyExW(HKEY_CURRENT_USER, kWindowStateKey, 0, KEY_READ, &key) !=
      ERROR_SUCCESS) {
    return std::nullopt;
  }

  DWORD x = 0;
  DWORD y = 0;
  DWORD width = 0;
  DWORD height = 0;
  DWORD maximized = 0;
  const bool ok = ReadDword(key, L"X", &x) && ReadDword(key, L"Y", &y) &&
                  ReadDword(key, L"Width", &width) &&
                  ReadDword(key, L"Height", &height) &&
                  ReadDword(key, L"Maximized", &maximized);
  RegCloseKey(key);

  if (!ok || width < 640 || height < 480) {
    return std::nullopt;
  }

  WindowState state{};
  state.rect.left = static_cast<LONG>(x);
  state.rect.top = static_cast<LONG>(y);
  state.rect.right = static_cast<LONG>(x + width);
  state.rect.bottom = static_cast<LONG>(y + height);
  state.maximized = maximized != 0;
  return state;
}

void SaveWindowState(HWND hwnd) {
  if (hwnd == nullptr) {
    return;
  }

  WINDOWPLACEMENT placement{};
  placement.length = sizeof(placement);
  if (!GetWindowPlacement(hwnd, &placement)) {
    return;
  }

  const RECT rect = placement.rcNormalPosition;
  const DWORD width = static_cast<DWORD>(rect.right - rect.left);
  const DWORD height = static_cast<DWORD>(rect.bottom - rect.top);
  if (width < 640 || height < 480) {
    return;
  }

  HKEY key = nullptr;
  if (RegCreateKeyExW(HKEY_CURRENT_USER, kWindowStateKey, 0, nullptr, 0,
                      KEY_SET_VALUE, nullptr, &key, nullptr) != ERROR_SUCCESS) {
    return;
  }

  WriteDword(key, L"X", static_cast<DWORD>(rect.left));
  WriteDword(key, L"Y", static_cast<DWORD>(rect.top));
  WriteDword(key, L"Width", width);
  WriteDword(key, L"Height", height);
  WriteDword(key, L"Maximized",
             placement.showCmd == SW_SHOWMAXIMIZED ? 1 : 0);
  RegCloseKey(key);
}

bool IsWindowStateUsable(const WindowState& state) {
  HMONITOR monitor = MonitorFromRect(&state.rect, MONITOR_DEFAULTTONULL);
  if (monitor == nullptr) {
    return false;
  }

  MONITORINFO info{};
  info.cbSize = sizeof(info);
  if (!GetMonitorInfoW(monitor, &info)) {
    return false;
  }

  RECT overlap{};
  if (!IntersectRect(&overlap, &state.rect, &info.rcWork)) {
    return false;
  }
  return overlap.right - overlap.left >= 160 &&
         overlap.bottom - overlap.top >= 120;
}

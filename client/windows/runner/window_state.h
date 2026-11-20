#ifndef RUNNER_WINDOW_STATE_H_
#define RUNNER_WINDOW_STATE_H_

#include <windows.h>

#include <optional>

// Persisted top-level window geometry.
struct WindowState {
  RECT rect;
  bool maximized;
};

// Loads the last window geometry from HKCU\Software\RedPen\Window.
std::optional<WindowState> LoadWindowState();

// Saves the current (restored) geometry. Called on WM_CLOSE / session end.
void SaveWindowState(HWND hwnd);

// True when the saved rect still overlaps a monitor work area enough to use.
bool IsWindowStateUsable(const WindowState& state);

#endif  // RUNNER_WINDOW_STATE_H_

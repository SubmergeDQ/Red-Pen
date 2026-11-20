#include <flutter/dart_project.h>
#include <flutter/flutter_view_controller.h>
#include <shellapi.h>
#include <shobjidl.h>
#include <windows.h>

#include <algorithm>
#include <optional>

#include "flutter_window.h"
#include "utils.h"
#include "window_state.h"

int APIENTRY wWinMain(_In_ HINSTANCE instance, _In_opt_ HINSTANCE prev,
                      _In_ wchar_t *command_line, _In_ int show_command) {
  // Attach to console when present (e.g., 'flutter run') or create a
  // new console when running with a debugger.
  if (!::AttachConsole(ATTACH_PARENT_PROCESS) && ::IsDebuggerPresent()) {
    CreateAndAttachConsole();
  }

  // Initialize COM, so that it is available for use in the library and/or
  // plugins.
  ::CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);

  // Keep the taskbar button, jump list and installer shortcut in one group,
  // so the pinned/running icon resolves to the new exe icon.
  ::SetCurrentProcessExplicitAppUserModelID(L"RedPen.Desktop.1");

  flutter::DartProject project(L"data");

  std::vector<std::string> command_line_arguments =
      GetCommandLineArguments();

  project.set_dart_entrypoint_arguments(std::move(command_line_arguments));

  FlutterWindow window(project);
  Win32Window::Point origin(10, 10);
  // 默认窗口按 1.1 交稿台的完整高度取值；首次启动时居中并夹到工作区，
  // 之后由注册表里的上次位置恢复。
  Win32Window::Size size(1320, 900);
  if (!window.Create(L"红笔 · 签约前 5 分钟", origin, size)) {
    return EXIT_FAILURE;
  }

  HWND handle = window.GetHandle();
  bool restored = false;
  if (std::optional<WindowState> saved = LoadWindowState();
      saved.has_value() && IsWindowStateUsable(*saved)) {
    const int width = saved->rect.right - saved->rect.left;
    const int height = saved->rect.bottom - saved->rect.top;
    SetWindowPos(handle, nullptr, saved->rect.left, saved->rect.top, width,
                 height, SWP_NOZORDER | SWP_NOACTIVATE);
    if (saved->maximized) {
      window.SetInitialShowCommand(SW_SHOWMAXIMIZED);
    }
    restored = true;
  }

  if (!restored) {
    RECT work_area{};
    RECT window_rect{};
    if (SystemParametersInfoW(SPI_GETWORKAREA, 0, &work_area, 0) &&
        GetWindowRect(handle, &window_rect)) {
      const int max_width = work_area.right - work_area.left;
      const int max_height = work_area.bottom - work_area.top;
      const int window_width =
          static_cast<int>(window_rect.right - window_rect.left);
      const int window_height =
          static_cast<int>(window_rect.bottom - window_rect.top);
      const int width = std::min(window_width, max_width);
      const int height = std::min(window_height, max_height);
      const int x = work_area.left + (max_width - width) / 2;
      const int y = work_area.top + (max_height - height) / 2;
      SetWindowPos(handle, nullptr, x, y, width, height,
                   SWP_NOZORDER | SWP_NOACTIVATE);
    }
  }
  window.SetQuitOnClose(true);

  ::MSG msg;
  while (::GetMessage(&msg, nullptr, 0, 0)) {
    ::TranslateMessage(&msg);
    ::DispatchMessage(&msg);
  }

  ::CoUninitialize();
  return EXIT_SUCCESS;
}

import 'dart:convert';
import 'dart:io';

import 'package:path_provider/path_provider.dart';

/// Remembers which version the user asked to skip, so the same prompt does not
/// come back on every launch.
class UpdateStore {
  static const _fileName = 'update_state.json';

  /// Some Windows setups refuse to create `%APPDATA%\<company>`, so fall back
  /// to the temp folder: losing a "skip this version" flag is harmless.
  Future<Directory> _dir() async {
    try {
      return await getApplicationSupportDirectory();
    } on Object {
      final temp = await getTemporaryDirectory();
      return Directory('${temp.path}${Platform.pathSeparator}red_pen');
    }
  }

  Future<File> _file() async {
    final dir = await _dir();
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return File('${dir.path}${Platform.pathSeparator}$_fileName');
  }

  Future<Map<String, dynamic>> _read() async {
    try {
      final file = await _file();
      if (!await file.exists()) return {};
      final raw = await file.readAsString();
      if (raw.trim().isEmpty) return {};
      final decoded = jsonDecode(raw);
      return decoded is Map<String, dynamic> ? decoded : {};
    } on Object {
      return {};
    }
  }

  Future<String?> ignoredVersion() async {
    final data = await _read();
    final value = data['ignoredVersion'];
    return value is String && value.isNotEmpty ? value : null;
  }

  Future<void> setIgnoredVersion(String? version) async {
    try {
      final data = await _read();
      if (version == null || version.isEmpty) {
        data.remove('ignoredVersion');
      } else {
        data['ignoredVersion'] = version;
      }
      final file = await _file();
      await file.writeAsString(jsonEncode(data), flush: true);
    } on Object {
      // Update preferences are a convenience; never block the app on them.
    }
  }
}

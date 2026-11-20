import 'package:flutter/foundation.dart';

import '../services/update_service.dart';
import '../services/update_store.dart';
import '../services/version.dart';

/// Owns the release list, the current app version and the "prompt once" state.
class UpdateController extends ChangeNotifier {
  UpdateController({
    UpdateService? service,
    UpdateStore? store,
    this.currentVersion = '0.0.0',
    this.buildNumber = '',
  })  : _service = service ?? UpdateService(),
        _store = store ?? UpdateStore();

  final UpdateService _service;
  final UpdateStore _store;

  String currentVersion;
  String buildNumber;

  List<ReleaseInfo> releases = const [];
  bool loading = false;
  String? error;
  DateTime? checkedAt;
  bool promptedThisSession = false;

  ReleaseInfo? get latestStable {
    for (final release in releases) {
      if (!release.prerelease) return release;
    }
    return null;
  }

  bool get hasUpdate {
    final latest = latestStable;
    return latest != null && isNewerVersion(latest.tag, currentVersion);
  }

  String get statusLabel {
    if (loading) return '正在检查更新…';
    if (error != null) return error!;
    if (checkedAt == null) return '还没有检查过更新';
    if (releases.isEmpty) return '仓库里还没有发行版';
    if (hasUpdate) return '发现新版本 ${latestStable!.tag}';
    return '已是最新版本';
  }

  Future<void> check() async {
    if (loading) return;
    loading = true;
    error = null;
    notifyListeners();
    try {
      releases = await _service.fetchReleases();
      checkedAt = DateTime.now();
    } on UpdateException catch (e) {
      error = e.message;
    } on Object {
      error = '检查更新失败，请稍后重试。';
    } finally {
      loading = false;
      notifyListeners();
    }
  }

  /// True at most once per launch, and never for a version the user skipped.
  Future<bool> shouldPrompt() async {
    if (!hasUpdate || promptedThisSession) return false;
    final ignored = await _store.ignoredVersion();
    if (ignored != null) {
      final skipped = SemVer.parse(ignored);
      final latest = SemVer.parse(latestStable!.tag);
      if (latest.compareTo(skipped) <= 0) return false;
    }
    promptedThisSession = true;
    return true;
  }

  Future<void> skipLatest() async {
    final latest = latestStable;
    if (latest == null) return;
    await _store.setIgnoredVersion(latest.tag);
    notifyListeners();
  }

  Future<String?> ignoredVersion() => _store.ignoredVersion();
}

import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

import 'package:red_pen/services/update_service.dart';
import 'package:red_pen/services/update_store.dart';
import 'package:red_pen/services/version.dart';
import 'package:red_pen/state/update_controller.dart';

class _FakeStore extends UpdateStore {
  _FakeStore([this.value]);

  String? value;

  @override
  Future<String?> ignoredVersion() async => value;

  @override
  Future<void> setIgnoredVersion(String? version) async {
    value = version;
  }
}

class _FakeService extends UpdateService {
  _FakeService(this.releases);

  final List<ReleaseInfo> releases;

  @override
  Future<List<ReleaseInfo>> fetchReleases({int limit = 30}) async => releases;
}

class _BrokenService extends UpdateService {
  @override
  Future<List<ReleaseInfo>> fetchReleases({int limit = 30}) async {
    throw const UpdateException('连不上 GitHub，请检查网络后重试。');
  }
}

ReleaseInfo _release(
  String tag, {
  bool prerelease = false,
  bool draft = false,
  List<Map<String, dynamic>> assets = const [],
}) {
  return ReleaseInfo.fromJson({
    'tag_name': tag,
    'name': '红笔 $tag',
    'body': '更新说明 $tag',
    'html_url': 'https://github.com/SubmergeDQ/Red-Pen/releases/tag/$tag',
    'published_at': '2026-11-20T08:00:00Z',
    'prerelease': prerelease,
    'draft': draft,
    'assets': [
      for (final asset in assets)
        {
          'name': asset['name'],
          'browser_download_url': asset['url'],
          'size': asset['size'] ?? 0,
        },
    ],
  })!;
}

void main() {
  group('SemVer', () {
    test('strips the v prefix and pads missing parts', () {
      expect(SemVer.parse('v1.2.3').toString(), '1.2.3');
      expect(SemVer.parse('1.2').toString(), '1.2.0');
      expect(SemVer.parse('release-2.0.1').toString(), '2.0.1');
    });

    test('compares numerically, not as text', () {
      expect(isNewerVersion('1.10.0', '1.9.9'), isTrue);
      expect(isNewerVersion('v1.0.1', '1.0.0'), isTrue);
      expect(isNewerVersion('1.0.0', '1.0.0'), isFalse);
      expect(isNewerVersion('1.0.0', '2.0.0'), isFalse);
    });

    test('ignores build metadata and ranks prereleases below stable', () {
      expect(SemVer.parse('1.0.0+7'), SemVer.parse('1.0.0'));
      expect(isNewerVersion('1.0.0-beta.2', '1.0.0'), isFalse);
      expect(isNewerVersion('1.0.0', '1.0.0-beta.2'), isTrue);
      expect(isNewerVersion('1.0.0-beta.10', '1.0.0-beta.2'), isTrue);
    });
  });

  group('ReleaseInfo', () {
    test('skips drafts and keeps fields', () {
      final json = {
        'tag_name': 'v1.2.0',
        'name': '红笔 1.2.0',
        'body': '- 修复\n- 优化',
        'html_url': 'https://github.com/SubmergeDQ/Red-Pen/releases/tag/v1.2.0',
        'published_at': '2026-11-20T08:00:00Z',
        'prerelease': false,
        'draft': true,
        'assets': const [],
      };
      expect(ReleaseInfo.fromJson(json), isNull);

      final release = _release('v1.2.0');
      expect(release.version, '1.2.0');
      expect(release.notes, contains('更新说明'));
      expect(release.publishedAt?.year, 2026);
      expect(release.prerelease, isFalse);
    });

    test('prefers the Windows installer over the portable zip', () {
      final release = _release('v1.0.0', assets: [
        {'name': '红笔-1.0.0-windows-x64.zip', 'url': 'https://example.com/a.zip', 'size': 2048},
        {'name': '红笔-1.0.0-windows-x64-setup.exe', 'url': 'https://example.com/a.exe', 'size': 1048576},
      ]);
      expect(release.download?.name, endsWith('.exe'));
      expect(release.download?.sizeLabel, '1.0 MB');
    });

    test('has no download when no platform asset exists', () {
      final release = _release('v1.0.0', assets: [
        {'name': 'notes.txt', 'url': 'https://example.com/notes.txt'},
      ]);
      expect(release.download, isNull);
    });
  });

  group('UpdateService', () {
    test('parses the release list and sorts newest first', () async {
      final service = UpdateService(
        client: MockClient((request) async {
          expect(request.headers['User-Agent'], isNotEmpty);
          expect(request.url.path, '/repos/SubmergeDQ/Red-Pen/releases');
          return http.Response(
            jsonEncode([
              {
                'tag_name': 'v1.0.0',
                'name': '红笔 1.0.0',
                'body': '首个正式版',
                'html_url': 'https://example.com/v1.0.0',
                'published_at': '2026-11-01T00:00:00Z',
                'prerelease': false,
                'draft': false,
                'assets': const [],
              },
              {
                'tag_name': 'v1.10.0',
                'name': '红笔 1.10.0',
                'body': '第十个次版本',
                'html_url': 'https://example.com/v1.10.0',
                'published_at': '2026-11-20T00:00:00Z',
                'prerelease': false,
                'draft': false,
                'assets': const [],
              },
            ]),
            200,
            headers: {'content-type': 'application/json; charset=utf-8'},
          );
        }),
      );

      final releases = await service.fetchReleases();
      expect(releases.map((r) => r.tag), ['v1.10.0', 'v1.0.0']);
    });

    test('maps HTTP failures to readable messages', () async {
      final service = UpdateService(
        client: MockClient((_) async => http.Response('', 404)),
      );
      expect(
        () => service.fetchReleases(),
        throwsA(isA<UpdateException>().having((e) => e.message, 'message', contains('仓库'))),
      );
    });
  });

  group('UpdateController', () {
    UpdateController build({
      required List<ReleaseInfo> releases,
      String current = '1.0.0',
      String? ignored,
    }) {
      return UpdateController(
        service: _FakeService(releases),
        store: _FakeStore(ignored),
        currentVersion: current,
      );
    }

    test('detects a newer stable release', () async {
      final controller = build(releases: [_release('v1.1.0'), _release('v1.0.0')]);
      await controller.check();
      expect(controller.hasUpdate, isTrue);
      expect(controller.latestStable?.tag, 'v1.1.0');
      expect(controller.statusLabel, contains('1.1.0'));
    });

    test('ignores prereleases when looking for the latest stable', () async {
      final controller = build(releases: [
        _release('v1.2.0-beta.1', prerelease: true),
        _release('v1.1.0'),
      ]);
      await controller.check();
      expect(controller.latestStable?.tag, 'v1.1.0');
    });

    test('reports no update when the local version is current', () async {
      final controller = build(releases: [_release('v1.0.0')]);
      await controller.check();
      expect(controller.hasUpdate, isFalse);
      expect(await controller.shouldPrompt(), isFalse);
      expect(controller.statusLabel, '已是最新版本');
    });

    test('prompts at most once per session', () async {
      final controller = build(releases: [_release('v1.1.0')]);
      await controller.check();
      expect(await controller.shouldPrompt(), isTrue);
      expect(await controller.shouldPrompt(), isFalse);
    });

    test('respects a skipped version and re-prompts for a newer one', () async {
      final skipped = build(releases: [_release('v1.1.0')], ignored: 'v1.1.0');
      await skipped.check();
      expect(await skipped.shouldPrompt(), isFalse);

      final newer = build(releases: [_release('v1.2.0')], ignored: 'v1.1.0');
      await newer.check();
      expect(await newer.shouldPrompt(), isTrue);
    });

    test('skipLatest remembers the tag for the next launch', () async {
      final store = _FakeStore();
      final controller = UpdateController(
        service: _FakeService([_release('v1.1.0')]),
        store: store,
        currentVersion: '1.0.0',
      );
      await controller.check();
      await controller.skipLatest();
      expect(store.value, 'v1.1.0');
    });

    test('surfaces network errors without crashing', () async {
      final controller = UpdateController(
        service: _BrokenService(),
        store: _FakeStore(),
        currentVersion: '1.0.0',
      );
      await controller.check();
      expect(controller.error, contains('连不上 GitHub'));
      expect(controller.hasUpdate, isFalse);
    });
  });
}

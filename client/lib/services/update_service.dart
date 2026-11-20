import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;

import 'version.dart';

class ReleaseAsset {
  const ReleaseAsset({required this.name, required this.url, this.size = 0});

  final String name;
  final String url;
  final int size;

  String get sizeLabel {
    if (size <= 0) return '';
    if (size >= 1024 * 1024) return '${(size / 1024 / 1024).toStringAsFixed(1)} MB';
    return '${(size / 1024).toStringAsFixed(0)} KB';
  }
}

class ReleaseInfo {
  const ReleaseInfo({
    required this.tag,
    required this.name,
    required this.notes,
    required this.htmlUrl,
    required this.publishedAt,
    required this.prerelease,
    required this.assets,
  });

  final String tag;
  final String name;
  final String notes;
  final String htmlUrl;
  final DateTime? publishedAt;
  final bool prerelease;
  final List<ReleaseAsset> assets;

  String get version => SemVer.parse(tag).toString();

  /// Picks the most useful download for the current platform.
  ReleaseAsset? get download {
    if (Platform.isAndroid) {
      final apks = assets.where((a) => a.name.toLowerCase().endsWith('.apk')).toList();
      if (apks.isEmpty) return null;
      for (final abi in ['arm64-v8a', 'armeabi-v7a', 'x86_64']) {
        for (final apk in apks) {
          if (apk.name.contains(abi)) return apk;
        }
      }
      return apks.first;
    }
    if (Platform.isWindows) {
      for (final asset in assets) {
        if (asset.name.toLowerCase().endsWith('.exe')) return asset;
      }
      for (final asset in assets) {
        if (asset.name.toLowerCase().endsWith('.zip')) return asset;
      }
    }
    return null;
  }

  static ReleaseInfo? fromJson(Map<String, dynamic> json) {
    if (json['draft'] == true) return null;
    final tag = (json['tag_name'] ?? '').toString();
    if (tag.isEmpty) return null;
    final assets = <ReleaseAsset>[];
    for (final raw in (json['assets'] as List?) ?? const []) {
      if (raw is! Map) continue;
      final url = (raw['browser_download_url'] ?? '').toString();
      final name = (raw['name'] ?? '').toString();
      if (url.isEmpty || name.isEmpty) continue;
      assets.add(ReleaseAsset(
        name: name,
        url: url,
        size: (raw['size'] as num?)?.toInt() ?? 0,
      ));
    }
    return ReleaseInfo(
      tag: tag,
      name: (json['name'] ?? tag).toString(),
      notes: (json['body'] ?? '').toString(),
      htmlUrl: (json['html_url'] ?? '').toString(),
      publishedAt: DateTime.tryParse((json['published_at'] ?? '').toString()),
      prerelease: json['prerelease'] == true,
      assets: assets,
    );
  }
}

class UpdateException implements Exception {
  const UpdateException(this.message);

  final String message;

  @override
  String toString() => message;
}

/// Reads public release metadata from GitHub. It never uploads anything: the
/// only traffic is a GET of the repository's release list.
class UpdateService {
  UpdateService({http.Client? client, this.repo = defaultRepo})
      : _client = client ?? http.Client();

  static const defaultRepo = 'SubmergeDQ/Red-Pen';
  static const repoUrl = 'https://github.com/SubmergeDQ/Red-Pen';
  static const releasesApi = 'https://api.github.com/repos';

  final http.Client _client;
  final String repo;

  Future<List<ReleaseInfo>> fetchReleases({int limit = 30}) async {
    final uri = Uri.parse('$releasesApi/$repo/releases?per_page=$limit');
    http.Response response;
    try {
      response = await _client.get(
        uri,
        headers: const {
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'RedPen-Updater',
        },
      ).timeout(const Duration(seconds: 10));
    } on SocketException {
      throw const UpdateException('连不上 GitHub，请检查网络后重试。');
    } on Exception {
      throw const UpdateException('检查更新超时了，请稍后重试。');
    }

    if (response.statusCode == 404) {
      throw const UpdateException('没有找到发行版仓库，请确认应用来源。');
    }
    if (response.statusCode == 403 || response.statusCode == 429) {
      throw const UpdateException('GitHub 暂时限制了请求频率，请过一会儿再试。');
    }
    if (response.statusCode != 200) {
      throw UpdateException('GitHub 返回 ${response.statusCode}，请稍后重试。');
    }

    final Object? decoded;
    try {
      decoded = jsonDecode(utf8.decode(response.bodyBytes));
    } on FormatException {
      throw const UpdateException('更新信息格式异常，请稍后重试。');
    }
    if (decoded is! List) {
      throw const UpdateException('更新信息格式异常，请稍后重试。');
    }

    final releases = <ReleaseInfo>[];
    for (final raw in decoded) {
      if (raw is! Map<String, dynamic>) continue;
      final release = ReleaseInfo.fromJson(raw);
      if (release != null) releases.add(release);
    }
    releases.sort((a, b) => SemVer.parse(b.tag).compareTo(SemVer.parse(a.tag)));
    return releases;
  }
}

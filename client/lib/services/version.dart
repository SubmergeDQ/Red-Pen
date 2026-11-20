/// Semantic version helpers used by the update check.
///
/// GitHub tags are messy in practice (`v1.0.0`, `1.0`, `release-1.2.3`), so the
/// parser keeps the numeric core, drops build metadata and compares
/// pre-release suffixes the way semver does.
class SemVer implements Comparable<SemVer> {
  const SemVer(this.parts, this.preRelease);

  final List<int> parts;
  final List<String> preRelease;

  static SemVer parse(String raw) {
    var text = raw.trim();
    if (text.startsWith('v') || text.startsWith('V')) {
      text = text.substring(1);
    }
    text = text.split('+').first;
    // Tolerate prefixed tags such as `release-1.2.3`: keep from the first digit.
    text = text.replaceFirst(RegExp(r'^[^0-9]*'), '');
    final dash = text.indexOf('-');
    final core = dash >= 0 ? text.substring(0, dash) : text;
    final pre = dash >= 0
        ? text.substring(dash + 1).split('.').where((p) => p.isNotEmpty).toList()
        : const <String>[];

    final parts = <int>[];
    for (final chunk in core.split('.')) {
      final digits = RegExp(r'\d+').firstMatch(chunk)?.group(0);
      parts.add(digits == null ? 0 : int.parse(digits));
      if (parts.length == 3) break;
    }
    while (parts.length < 3) {
      parts.add(0);
    }
    return SemVer(parts, pre);
  }

  bool get isPrerelease => preRelease.isNotEmpty;

  @override
  int compareTo(SemVer other) {
    for (var i = 0; i < 3; i++) {
      final diff = parts[i] - other.parts[i];
      if (diff != 0) return diff.sign;
    }
    if (preRelease.isEmpty && other.preRelease.isEmpty) return 0;
    if (preRelease.isEmpty) return 1;
    if (other.preRelease.isEmpty) return -1;
    final length = preRelease.length < other.preRelease.length
        ? preRelease.length
        : other.preRelease.length;
    for (var i = 0; i < length; i++) {
      final a = preRelease[i];
      final b = other.preRelease[i];
      final aNum = int.tryParse(a);
      final bNum = int.tryParse(b);
      if (aNum != null && bNum != null) {
        final diff = aNum - bNum;
        if (diff != 0) return diff.sign;
      } else if (aNum != null) {
        return -1;
      } else if (bNum != null) {
        return 1;
      } else {
        final diff = a.compareTo(b);
        if (diff != 0) return diff.sign;
      }
    }
    return preRelease.length.compareTo(other.preRelease.length);
  }

  bool operator >(SemVer other) => compareTo(other) > 0;

  @override
  bool operator ==(Object other) =>
      other is SemVer && compareTo(other) == 0;

  @override
  int get hashCode => Object.hashAll([...parts, ...preRelease]);

  @override
  String toString() =>
      '${parts.join('.')}${preRelease.isEmpty ? '' : '-${preRelease.join('.')}'}';
}

/// True when [candidate] is a strictly newer release than [current].
bool isNewerVersion(String candidate, String current) =>
    SemVer.parse(candidate) > SemVer.parse(current);

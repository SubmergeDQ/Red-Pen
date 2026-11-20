import 'dart:typed_data';

import 'package:flutter_test/flutter_test.dart';
import 'package:image/image.dart' as img;
import 'package:red_pen/services/ocr/ocr.dart';

Uint8List _page(int width, int height) {
  final image = img.Image(width: width, height: height);
  img.fill(image, color: img.ColorRgb8(245, 245, 245));
  // A dark block so the level stretch has something to work with.
  img.fillRect(
    image,
    x1: 10,
    y1: 10,
    x2: width ~/ 2,
    y2: height ~/ 3,
    color: img.ColorRgb8(40, 40, 40),
  );
  return Uint8List.fromList(img.encodePng(image));
}

void main() {
  test('tall pages are split into overlapping tiles', () {
    final tiles = prepareOcrTiles(_page(600, 3000));
    expect(tiles.length, greaterThan(1));
    for (final tile in tiles) {
      expect(tile.length, greaterThan(1000));
    }
  });

  test('small images become a single tile and are upscaled', () {
    final tiles = prepareOcrTiles(_page(400, 300));
    expect(tiles, hasLength(1));
  });

  test('wide screenshots are downscaled to a single tile', () {
    final tiles = prepareOcrTiles(_page(3200, 1400));
    expect(tiles, hasLength(1));
  });

  test('tile merge drops the duplicated overlap lines', () {
    final merged = mergeOcrTiles([
      '第一条 合同期限\n第二条 工作内容\n第三条 劳动报酬',
      '第二条 工作内容\n第三条 劳动报酬\n第四条 社会保险',
      '第四条 社会保险\n第五条 解除',
    ]);
    expect(
      merged,
      '第一条 合同期限\n第二条 工作内容\n第三条 劳动报酬\n第四条 社会保险\n第五条 解除',
    );
  });

  test('tile merge keeps repeated clauses that are genuinely separate', () {
    final merged = mergeOcrTiles([
      '甲方：甲公司\n乙方：张三',
      '第一条 期限\n第二条 报酬',
    ]);
    expect(merged, '甲方：甲公司\n乙方：张三\n第一条 期限\n第二条 报酬');
  });
}

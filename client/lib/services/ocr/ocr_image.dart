import 'dart:math' as math;
import 'dart:typed_data';

import 'package:image/image.dart' as img;

/// Pure image preparation for OCR. Kept free of Flutter imports so the same
/// code runs in the app, in tests and in `tool/ocr_bench.dart`.
///
/// A tall scan is the hard case: feeding a 1057×4803 page as one image makes
/// every OCR engine downscale the text to a few pixels. So the page is
/// contrast-stretched, scaled to a readable width and cut into overlapping
/// vertical tiles that each keep a sensible aspect ratio.
const int ocrTargetWidth = 1600;
const double ocrMaxUpscale = 2.2;
const double ocrTileAspect = 2.0;
const double ocrTileOverlap = 0.08;

/// Prepares 1..n JPEG tiles, top to bottom, in reading order.
///
/// [tileAspect] is height / width. Android's ML Kit rejects very tall images,
/// so the Android service asks for a squarer tile than the Windows engine.
List<Uint8List> prepareOcrTiles(Uint8List bytes, {double tileAspect = ocrTileAspect}) {
  final decoded = img.decodeImage(bytes);
  if (decoded == null) {
    throw const FormatException('无法读取这张图片');
  }
  var image = img.bakeOrientation(decoded);
  image = _stretchLevels(image);
  image = _resizeToWidth(image);
  image = _flattenOnWhite(image);

  final tileHeight = math.max(200, (image.width * tileAspect).round());
  final overlap = (tileHeight * ocrTileOverlap).round();

  if (image.height <= (tileHeight * 1.15).round()) {
    return [_encode(image)];
  }

  final tiles = <Uint8List>[];
  var top = 0;
  while (top < image.height) {
    final bottom = math.min(top + tileHeight, image.height);
    final tile = img.copyCrop(
      image,
      x: 0,
      y: top,
      width: image.width,
      height: bottom - top,
    );
    tiles.add(_encode(tile));
    if (bottom >= image.height) break;
    top = math.max(bottom - overlap, top + 1);
  }
  return tiles;
}

Uint8List _encode(img.Image image) {
  return Uint8List.fromList(img.encodeJpg(image, quality: 95));
}

/// Transparent PNGs (screenshots, copied images) have black RGB under alpha 0,
/// which reads as noise. Put everything on white first.
img.Image _flattenOnWhite(img.Image image) {
  if (!image.hasAlpha) return image;
  final background = img.Image(width: image.width, height: image.height);
  img.fill(background, color: img.ColorRgb8(255, 255, 255));
  img.compositeImage(background, image);
  return background;
}

img.Image _resizeToWidth(img.Image image) {
  final target = ocrTargetWidth;
  if (image.width == target) return image;
  if (image.width > target) {
    final height = (image.height * target / image.width).round();
    return img.copyResize(
      image,
      width: target,
      height: height,
      interpolation: img.Interpolation.average,
    );
  }
  final width = math.min(target, (image.width * ocrMaxUpscale).round());
  if (width <= image.width) return image;
  final height = (image.height * width / image.width).round();
  return img.copyResize(
    image,
    width: width,
    height: height,
    interpolation: img.Interpolation.cubic,
  );
}

/// Maps the 2nd..98th luminance percentile onto the full range, which turns a
/// grey photocopy into black text on white without clipping thin strokes.
img.Image _stretchLevels(img.Image image) {
  final rgb = image.getBytes(order: img.ChannelOrder.rgb);
  final histogram = Uint32List(256);
  var sampled = 0;
  const step = 4;
  for (var i = 0; i + 2 < rgb.length; i += 3 * step) {
    final luma = (rgb[i] * 299 + rgb[i + 1] * 587 + rgb[i + 2] * 114) ~/ 1000;
    histogram[luma]++;
    sampled++;
  }
  if (sampled == 0) return image;

  var low = 0;
  var high = 255;
  final lowTarget = (sampled * 0.02).round();
  final highTarget = (sampled * 0.98).round();
  var running = 0;
  for (var value = 0; value < 256; value++) {
    running += histogram[value];
    if (running >= lowTarget) {
      low = value;
      break;
    }
  }
  running = 0;
  for (var value = 0; value < 256; value++) {
    running += histogram[value];
    if (running >= highTarget) {
      high = value;
      break;
    }
  }
  if (high - low < 24) return image;

  final lut = Uint8List(256);
  for (var value = 0; value < 256; value++) {
    lut[value] = ((value - low) * 255 / (high - low)).round().clamp(0, 255);
  }
  for (var i = 0; i < rgb.length; i++) {
    rgb[i] = lut[rgb[i]];
  }
  return img.Image.fromBytes(
    width: image.width,
    height: image.height,
    bytes: rgb.buffer,
    order: img.ChannelOrder.rgb,
  );
}

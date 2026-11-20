# google_mlkit_text_recognition references every script in one class, while the
# app only ships the Chinese model.
-dontwarn com.google.mlkit.vision.text.chinese.**
-dontwarn com.google.mlkit.vision.text.devanagari.**
-dontwarn com.google.mlkit.vision.text.japanese.**
-dontwarn com.google.mlkit.vision.text.korean.**

# ML Kit registers its recognizer implementations and loads the bundled model
# through reflection, so R8 shrinking/optimization corrupts the registration
# table. Symptom in release builds:
#   Attempt to read from field 'xn1.a' on a null object reference
#   in com.google.mlkit.vision.text.TextRecognition.getClient(...)
# Keep the whole SDK surface plus every internal implementation package.
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.internal.mlkit_** { *; }

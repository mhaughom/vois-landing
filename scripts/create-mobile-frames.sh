#!/bin/bash

# Script to create mobile-optimized frame versions
# Resizes frames from 512x512 to 256x256 for faster mobile loading

echo "🎬 Creating mobile-optimized frames (256x256)..."

# Create mobile directories
mkdir -p public/frames/phone-mobile
mkdir -p public/frames/watch-mobile

# Function to resize webp file
resize_webp() {
  input="$1"
  output="$2"
  temp_in="/tmp/frame_temp_in.png"
  temp_out="/tmp/frame_temp_out.png"

  # Decode webp to png
  dwebp "$input" -o "$temp_in" > /dev/null 2>&1

  # Resize with sips
  sips -z 256 256 "$temp_in" --out "$temp_out" > /dev/null 2>&1

  # Encode back to webp with quality 85
  cwebp -q 85 "$temp_out" -o "$output" > /dev/null 2>&1

  # Clean up temp files
  rm -f "$temp_in" "$temp_out"
}

# Process phone frames
echo "📱 Processing phone frames (0/60)..."
count=0
total=60
for file in public/frames/phone/frame_*.webp; do
  filename=$(basename "$file")
  resize_webp "$file" "public/frames/phone-mobile/$filename"
  count=$((count + 1))
  if [ $((count % 10)) -eq 0 ]; then
    echo "   Progress: $count/$total frames"
  fi
done
echo "   ✓ Phone complete: $count frames"

# Process watch frames
echo "⌚ Processing watch frames (0/60)..."
count=0
for file in public/frames/watch/frame_*.webp; do
  filename=$(basename "$file")
  resize_webp "$file" "public/frames/watch-mobile/$filename"
  count=$((count + 1))
  if [ $((count % 10)) -eq 0 ]; then
    echo "   Progress: $count/$total frames"
  fi
done
echo "   ✓ Watch complete: $count frames"

echo ""
echo "✅ Done!"
echo ""
echo "📊 File size comparison:"
original_phone=$(du -sh public/frames/phone | cut -f1)
mobile_phone=$(du -sh public/frames/phone-mobile | cut -f1)
original_watch=$(du -sh public/frames/watch | cut -f1)
mobile_watch=$(du -sh public/frames/watch-mobile | cut -f1)

echo "   Phone: $original_phone → $mobile_phone"
echo "   Watch: $original_watch → $mobile_watch"

# Calculate percentage reduction
phone_orig_kb=$(du -sk public/frames/phone | cut -f1)
phone_mobile_kb=$(du -sk public/frames/phone-mobile | cut -f1)
watch_orig_kb=$(du -sk public/frames/watch | cut -f1)
watch_mobile_kb=$(du -sk public/frames/watch-mobile | cut -f1)

if [ $phone_orig_kb -gt 0 ]; then
  phone_reduction=$(echo "scale=1; (1 - $phone_mobile_kb / $phone_orig_kb) * 100" | bc)
  echo "   Phone reduction: ${phone_reduction}%"
fi

if [ $watch_orig_kb -gt 0 ]; then
  watch_reduction=$(echo "scale=1; (1 - $watch_mobile_kb / $watch_orig_kb) * 100" | bc)
  echo "   Watch reduction: ${watch_reduction}%"
fi

#!/bin/bash

# Optional: Add text overlays to placeholder images using ImageMagick
# First install: brew install imagemagick

cd "$(dirname "$0")/public/Photos"

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick not found. Install with:"
    echo "   brew install imagemagick"
    exit 1
fi

echo "🎨 Adding text overlays to placeholder images..."

# Phone placeholders
echo ""
echo "📱 Creating phone placeholders with text..."
magick "IMG_3495 2.PNG" \
    -pointsize 100 -fill white -stroke black -strokewidth 3 \
    -gravity center -annotate +0+0 "TASKS" \
    -quality 95 phone-tasks.png && echo "✅ Created: phone-tasks.png"

magick "IMG_3495 2.PNG" \
    -pointsize 100 -fill white -stroke black -strokewidth 3 \
    -gravity center -annotate +0+0 "JOURNAL" \
    -quality 95 phone-journal.png && echo "✅ Created: phone-journal.png"

magick "IMG_3495 2.PNG" \
    -pointsize 100 -fill white -stroke black -strokewidth 3 \
    -gravity center -annotate +0+0 "TO-DO LIST" \
    -quality 95 phone-todo.png && echo "✅ Created: phone-todo.png"

# MacBook placeholders
echo ""
echo "💻 Creating MacBook placeholders with text..."
magick "macbook-screen.webp" \
    -pointsize 140 -fill white -stroke black -strokewidth 4 \
    -gravity center -annotate +0+0 "TASKS" \
    -quality 95 mac-tasks.png && echo "✅ Created: mac-tasks.png"

magick "macbook-screen.webp" \
    -pointsize 140 -fill white -stroke black -strokewidth 4 \
    -gravity center -annotate +0+0 "JOURNAL" \
    -quality 95 mac-journal.png && echo "✅ Created: mac-journal.png"

magick "macbook-screen.webp" \
    -pointsize 140 -fill white -stroke black -strokewidth 4 \
    -gravity center -annotate +0+0 "TO-DO LIST" \
    -quality 95 mac-todo.png && echo "✅ Created: mac-todo.png"

echo ""
echo "🎉 Done! All placeholders now have text overlays."
echo ""
ls -lh phone-tasks.png phone-journal.png phone-todo.png mac-tasks.png mac-journal.png mac-todo.png

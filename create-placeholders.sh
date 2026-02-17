#!/bin/bash

# Create placeholder images by duplicating existing ones
# This provides immediate functionality - replace with actual screenshots later

cd "$(dirname "$0")/public/Photos"

echo "🎨 Creating placeholder images..."

# Check if source images exist
if [ ! -f "IMG_3495 2.PNG" ]; then
    echo "❌ Source phone image not found: IMG_3495 2.PNG"
    exit 1
fi

if [ ! -f "macbook-screen.webp" ]; then
    echo "❌ Source MacBook image not found: macbook-screen.webp"
    exit 1
fi

echo ""
echo "📱 Creating phone placeholders..."

# Create phone placeholders by copying the original
cp "IMG_3495 2.PNG" "phone-tasks.png" && echo "✅ Created: phone-tasks.png"
cp "IMG_3495 2.PNG" "phone-journal.png" && echo "✅ Created: phone-journal.png"
cp "IMG_3495 2.PNG" "phone-todo.png" && echo "✅ Created: phone-todo.png"

echo ""
echo "💻 Creating MacBook placeholders..."

# Create MacBook placeholders by copying the original
cp "macbook-screen.webp" "mac-tasks.png" && echo "✅ Created: mac-tasks.png"
cp "macbook-screen.webp" "mac-journal.png" && echo "✅ Created: mac-journal.png"
cp "macbook-screen.webp" "mac-todo.png" && echo "✅ Created: mac-todo.png"

echo ""
echo "🎉 Done! Placeholder images created."
echo ""
echo "📝 Note: These are duplicates of the original images."
echo "   To add text overlays, install ImageMagick:"
echo "   brew install imagemagick"
echo ""
echo "   Then use this command to add text:"
echo '   magick "IMG_3495 2.PNG" -pointsize 100 -fill white -stroke black \'
echo '     -strokewidth 2 -gravity center -annotate +0+0 "TASKS" phone-tasks.png'
echo ""
echo "Generated files:"
ls -lh phone-tasks.png phone-journal.png phone-todo.png mac-tasks.png mac-journal.png mac-todo.png 2>/dev/null

#!/bin/bash

# Video Optimization Script
# Creates desktop (1080p) and mobile (720p) optimized versions
# Usage: ./scripts/optimize-videos.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}           VOIS Video Optimization Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo -e "${YELLOW}⚠️  ffmpeg not found. Installing via Homebrew...${NC}"
    brew install ffmpeg
fi

# Create backup directory
BACKUP_DIR="public/videos/originals"
mkdir -p "$BACKUP_DIR"

# Function to get file size in MB
get_size_mb() {
    local size=$(stat -f%z "$1" 2>/dev/null || stat -c%s "$1" 2>/dev/null)
    echo "scale=2; $size / 1024 / 1024" | bc
}

# Function to optimize video for desktop (1080p)
optimize_desktop() {
    local input=$1
    local output=$2
    local bitrate=${3:-1200k}  # Default 1.2 Mbps

    echo -e "${BLUE}🖥️  Optimizing for desktop (1080p)...${NC}"

    ffmpeg -i "$input" \
        -c:v libx264 \
        -preset slow \
        -crf 28 \
        -b:v "$bitrate" \
        -maxrate "$bitrate" \
        -bufsize $(echo "$bitrate * 2" | bc) \
        -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -y \
        "$output" 2>&1 | grep -E "frame=|time=|size=" || true

    echo -e "${GREEN}✓ Desktop version created${NC}"
}

# Function to optimize video for mobile (720p)
optimize_mobile() {
    local input=$1
    local output=$2
    local bitrate=${3:-800k}  # Default 800 kbps

    echo -e "${BLUE}📱 Optimizing for mobile (720p)...${NC}"

    ffmpeg -i "$input" \
        -c:v libx264 \
        -preset slow \
        -crf 30 \
        -b:v "$bitrate" \
        -maxrate "$bitrate" \
        -bufsize $(echo "$bitrate * 2" | bc) \
        -vf "scale=720:-2" \
        -c:a aac \
        -b:a 96k \
        -movflags +faststart \
        -y \
        "$output" 2>&1 | grep -E "frame=|time=|size=" || true

    echo -e "${GREEN}✓ Mobile version created${NC}"
}

# Function to show before/after comparison
show_comparison() {
    local original=$1
    local desktop=$2
    local mobile=$3

    local orig_size=$(get_size_mb "$original")
    local desk_size=$(get_size_mb "$desktop")
    local mob_size=$(get_size_mb "$mobile")
    local total_saved=$(echo "$orig_size - $desk_size - $mob_size" | bc)

    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Results for $(basename "$original"):${NC}"
    echo -e "  Original:        ${orig_size} MB"
    echo -e "  Desktop (1080p): ${desk_size} MB"
    echo -e "  Mobile (720p):   ${mob_size} MB"
    echo -e "  ${GREEN}Combined size:   $(echo "$desk_size + $mob_size" | bc) MB${NC}"
    echo -e "  ${YELLOW}Savings:         -${total_saved} MB (from single original)${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# ============================================================================
# PROCESS VIDEOS
# ============================================================================

cd "$(dirname "$0")/.."

echo -e "${YELLOW}Starting optimization process...${NC}\n"

# 1. KLING VIDEO (landscape) - Biggest offender
# ============================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Processing: Landscape video (kling)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

KLING_INPUT="public/videos/kling_20260107_Image_to_Video_Static_sho_2574_2.mp4"
KLING_DESKTOP="public/videos/landscape-desktop.mp4"
KLING_MOBILE="public/videos/landscape-mobile-optimized.mp4"

if [ -f "$KLING_INPUT" ]; then
    # Backup original
    cp "$KLING_INPUT" "$BACKUP_DIR/"

    # Optimize (10s video, can use lower bitrate)
    optimize_desktop "$KLING_INPUT" "$KLING_DESKTOP" "1000k"
    optimize_mobile "$KLING_INPUT" "$KLING_MOBILE" "600k"

    show_comparison "$KLING_INPUT" "$KLING_DESKTOP" "$KLING_MOBILE"
else
    echo -e "${YELLOW}⚠️  Kling video not found, skipping...${NC}"
fi

# 2. SITUATIONS VIDEO
# ============================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Processing: Situations video${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

SITUATIONS_INPUT="public/videos/Situations.mp4"
SITUATIONS_DESKTOP="public/videos/Situations-desktop.mp4"
SITUATIONS_MOBILE="public/videos/Situations-mobile-optimized.mp4"

if [ -f "$SITUATIONS_INPUT" ]; then
    # Backup original
    cp "$SITUATIONS_INPUT" "$BACKUP_DIR/"

    # Optimize (27s video, moderate bitrate)
    optimize_desktop "$SITUATIONS_INPUT" "$SITUATIONS_DESKTOP" "1200k"
    optimize_mobile "$SITUATIONS_INPUT" "$SITUATIONS_MOBILE" "700k"

    show_comparison "$SITUATIONS_INPUT" "$SITUATIONS_DESKTOP" "$SITUATIONS_MOBILE"
else
    echo -e "${YELLOW}⚠️  Situations video not found, skipping...${NC}"
fi

# 3. MESSY MAN VIDEO (already optimized but create mobile version)
# ============================================================================
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Processing: Messy man video${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

MESSY_INPUT="public/videos/messy-man-loop-optimized.mp4"
MESSY_DESKTOP="public/videos/messy-man-desktop.mp4"
MESSY_MOBILE="public/videos/messy-man-mobile.mp4"

if [ -f "$MESSY_INPUT" ]; then
    # Copy as desktop version (already optimized)
    echo -e "${BLUE}🖥️  Creating desktop version (already optimized)...${NC}"
    cp "$MESSY_INPUT" "$MESSY_DESKTOP"
    echo -e "${GREEN}✓ Desktop version created${NC}"

    # Create mobile version
    optimize_mobile "$MESSY_INPUT" "$MESSY_MOBILE" "700k"

    show_comparison "$MESSY_INPUT" "$MESSY_DESKTOP" "$MESSY_MOBILE"
else
    echo -e "${YELLOW}⚠️  Messy man video not found, skipping...${NC}"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}              ✓ OPTIMIZATION COMPLETE${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\n${BLUE}📁 Originals backed up to:${NC} $BACKUP_DIR"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. Test the new videos on desktop and mobile"
echo -e "  2. Update your code to use -desktop and -mobile versions"
echo -e "  3. If satisfied, delete the originals to save space"
echo -e "  4. Commit the optimized versions to git"
echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Show total directory size
echo -e "${BLUE}Current videos directory size:${NC}"
du -sh public/videos/
echo ""

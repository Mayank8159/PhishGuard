"""
Generate PhishGuard app icon
Creates a shield-themed icon for the app
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_shield_icon(size, output_path):
    """Create a shield-themed PhishGuard icon"""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Dark blue background circle
    margin = size // 10
    draw.ellipse(
        [margin, margin, size - margin, size - margin],
        fill=(10, 15, 28, 255)  # #0A0F1C
    )
    
    # Draw shield shape
    shield_margin = size // 4
    shield_width = size - (shield_margin * 2)
    shield_height = int(shield_width * 1.2)
    
    # Shield coordinates
    shield_top = size // 3.5
    shield_bottom = shield_top + shield_height
    shield_left = shield_margin
    shield_right = size - shield_margin
    shield_center = size // 2
    
    # Create shield path (outline)
    shield_points = [
        (shield_center, shield_top),  # Top point
        (shield_right, shield_top + shield_height // 4),  # Right top
        (shield_right, shield_top + shield_height // 2),  # Right middle
        (shield_center, shield_bottom),  # Bottom point
        (shield_left, shield_top + shield_height // 2),  # Left middle
        (shield_left, shield_top + shield_height // 4),  # Left top
    ]
    
    # Draw shield fill (gradient effect with multiple polygons)
    # Outer shield (darker)
    draw.polygon(shield_points, fill=(34, 139, 230, 255))  # Blue #228BE6
    
    # Inner shield (lighter, smaller)
    inner_margin = size // 20
    inner_points = [
        (shield_center, shield_top + inner_margin),
        (shield_right - inner_margin, shield_top + shield_height // 4 + inner_margin // 2),
        (shield_right - inner_margin, shield_top + shield_height // 2 + inner_margin),
        (shield_center, shield_bottom - inner_margin * 2),
        (shield_left + inner_margin, shield_top + shield_height // 2 + inner_margin),
        (shield_left + inner_margin, shield_top + shield_height // 4 + inner_margin // 2),
    ]
    draw.polygon(inner_points, fill=(56, 161, 243, 255))  # Lighter blue
    
    # Draw checkmark in center
    check_size = size // 6
    check_center_x = shield_center
    check_center_y = shield_top + shield_height // 2.2
    
    # Checkmark path
    check_start = (check_center_x - check_size // 2, check_center_y)
    check_mid = (check_center_x - check_size // 6, check_center_y + check_size // 2)
    check_end = (check_center_x + check_size // 1.5, check_center_y - check_size // 2)
    
    # Draw thick checkmark
    line_width = max(size // 30, 8)
    draw.line([check_start, check_mid], fill=(255, 255, 255, 255), width=line_width)
    draw.line([check_mid, check_end], fill=(255, 255, 255, 255), width=line_width)
    
    # Add subtle glow effect around shield
    for i in range(3):
        alpha = 30 - (i * 10)
        glow_offset = i * 3
        glow_points = [
            (shield_center, shield_top - glow_offset),
            (shield_right + glow_offset, shield_top + shield_height // 4),
            (shield_right + glow_offset, shield_top + shield_height // 2),
            (shield_center, shield_bottom + glow_offset),
            (shield_left - glow_offset, shield_top + shield_height // 2),
            (shield_left - glow_offset, shield_top + shield_height // 4),
        ]
        draw.polygon(glow_points, outline=(56, 161, 243, alpha))
    
    # Save image
    img.save(output_path, 'PNG', quality=95)
    print(f"✓ Created {output_path} ({size}x{size})")


def create_adaptive_icon(size, output_path):
    """Create Android adaptive icon (foreground only)"""
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw shield shape (larger for adaptive icon)
    shield_margin = size // 5
    shield_width = size - (shield_margin * 2)
    shield_height = int(shield_width * 1.2)
    
    shield_top = size // 4
    shield_bottom = shield_top + shield_height
    shield_left = shield_margin
    shield_right = size - shield_margin
    shield_center = size // 2
    
    shield_points = [
        (shield_center, shield_top),
        (shield_right, shield_top + shield_height // 4),
        (shield_right, shield_top + shield_height // 2),
        (shield_center, shield_bottom),
        (shield_left, shield_top + shield_height // 2),
        (shield_left, shield_top + shield_height // 4),
    ]
    
    # Blue shield
    draw.polygon(shield_points, fill=(34, 139, 230, 255))
    
    # Inner shield
    inner_margin = size // 20
    inner_points = [
        (shield_center, shield_top + inner_margin),
        (shield_right - inner_margin, shield_top + shield_height // 4 + inner_margin // 2),
        (shield_right - inner_margin, shield_top + shield_height // 2 + inner_margin),
        (shield_center, shield_bottom - inner_margin * 2),
        (shield_left + inner_margin, shield_top + shield_height // 2 + inner_margin),
        (shield_left + inner_margin, shield_top + shield_height // 4 + inner_margin // 2),
    ]
    draw.polygon(inner_points, fill=(56, 161, 243, 255))
    
    # Checkmark
    check_size = size // 5
    check_center_x = shield_center
    check_center_y = shield_top + shield_height // 2.2
    
    check_start = (check_center_x - check_size // 2, check_center_y)
    check_mid = (check_center_x - check_size // 6, check_center_y + check_size // 2)
    check_end = (check_center_x + check_size // 1.5, check_center_y - check_size // 2)
    
    line_width = max(size // 25, 10)
    draw.line([check_start, check_mid], fill=(255, 255, 255, 255), width=line_width)
    draw.line([check_mid, check_end], fill=(255, 255, 255, 255), width=line_width)
    
    img.save(output_path, 'PNG', quality=95)
    print(f"✓ Created {output_path} ({size}x{size})")


def create_favicon(size, output_path):
    """Create favicon"""
    img = Image.new('RGBA', (size, size), (10, 15, 28, 255))
    draw = ImageDraw.Draw(img)
    
    # Simple shield for small favicon
    shield_margin = size // 6
    shield_width = size - (shield_margin * 2)
    shield_height = int(shield_width * 1.1)
    
    shield_top = size // 6
    shield_bottom = shield_top + shield_height
    shield_left = shield_margin
    shield_right = size - shield_margin
    shield_center = size // 2
    
    shield_points = [
        (shield_center, shield_top),
        (shield_right, shield_top + shield_height // 4),
        (shield_right, shield_top + shield_height // 2),
        (shield_center, shield_bottom),
        (shield_left, shield_top + shield_height // 2),
        (shield_left, shield_top + shield_height // 4),
    ]
    
    draw.polygon(shield_points, fill=(34, 139, 230, 255))
    
    # Simple checkmark
    check_size = size // 4
    check_center_x = shield_center
    check_center_y = shield_top + shield_height // 2.2
    
    check_start = (check_center_x - check_size // 2, check_center_y)
    check_mid = (check_center_x - check_size // 6, check_center_y + check_size // 2)
    check_end = (check_center_x + check_size // 1.5, check_center_y - check_size // 2)
    
    line_width = max(size // 16, 3)
    draw.line([check_start, check_mid], fill=(255, 255, 255, 255), width=line_width)
    draw.line([check_mid, check_end], fill=(255, 255, 255, 255), width=line_width)
    
    img.save(output_path, 'PNG', quality=95)
    print(f"✓ Created {output_path} ({size}x{size})")


def main():
    """Generate all icon files"""
    # Get the assets directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    assets_dir = os.path.join(project_root, 'PhishGuard', 'assets', 'images')
    
    if not os.path.exists(assets_dir):
        print(f"Error: Assets directory not found: {assets_dir}")
        return
    
    print("🎨 Generating PhishGuard app icons...\n")
    
    # Main app icon (1024x1024 for iOS App Store)
    icon_path = os.path.join(assets_dir, 'icon.png')
    create_shield_icon(1024, icon_path)
    
    # Android adaptive icon (512x512 recommended)
    adaptive_path = os.path.join(assets_dir, 'adaptive-icon.png')
    create_adaptive_icon(1024, adaptive_path)
    
    # Splash screen icon (can be same as main icon)
    splash_path = os.path.join(assets_dir, 'splash-icon.png')
    create_shield_icon(1024, splash_path)
    
    # Favicon (48x48 or 64x64)
    favicon_path = os.path.join(assets_dir, 'favicon.png')
    create_favicon(48, favicon_path)
    
    print("\n✅ All icons generated successfully!")
    print("\nIcon files created:")
    print(f"  • icon.png (1024x1024) - Main app icon")
    print(f"  • adaptive-icon.png (1024x1024) - Android adaptive icon")
    print(f"  • splash-icon.png (1024x1024) - Splash screen")
    print(f"  • favicon.png (48x48) - Web favicon")
    print("\n📱 Rebuild your app to see the new icons:")
    print("  npx expo start --clear")


if __name__ == "__main__":
    main()

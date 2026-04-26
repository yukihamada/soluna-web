#!/usr/bin/env python3
"""
Replace tel: links with chatbot triggers and add chat-widget.js to pages missing it.
"""

import re
import os

BASE_DIR = "/Users/yuki/workspace/teshikaga-cabin"

# Files to process for tel: link replacement
TEL_FILES = [
    "buy.html", "construction.html", "ichiki.html", "index.html",
    "instant-kumaushi.html", "instant.html", "nesting.html", "network.html",
    "offgrid.html", "ops.html", "status.html", "workparty.html",
]

# Files that already have chat-widget.js (skip adding)
ALREADY_HAS_WIDGET = {
    "construction.html", "index.html", "calendar.html",
    "join.html", "member.html", "plans.html",
}

# Files that need chat-widget.js added
NEED_WIDGET = [
    "buy.html", "ichiki.html", "instant-kumaushi.html", "instant.html",
    "nesting.html", "network.html", "offgrid.html", "ops.html",
    "status.html", "workparty.html",
]

CHAT_ONCLICK = 'href="#" onclick="typeof scToggle!==\'undefined\'&&scToggle();return false"'
CHAT_SCRIPT = '<script src="/chat-widget.js" defer></script>'

def replace_tel_links(content, filename):
    """
    Step 1: Replace tel: href attributes with chatbot trigger onclick.
    Step 2: Within converted links, fix display text.
    Returns (new_content, changes_list)
    """
    changes = []
    original = content

    # Pattern to match full <a> tags with tel: phone numbers (both formats)
    # We'll use a callback to transform each matched anchor tag
    def replace_anchor(m):
        tag = m.group(0)
        original_tag = tag

        # Only process if it contains our target phone numbers
        if not re.search(r'tel:(09074090407|090-7409-0407)', tag):
            return tag

        # Replace the href attribute
        tag = re.sub(
            r'href="tel:(09074090407|090-7409-0407)"',
            CHAT_ONCLICK,
            tag
        )

        # Replace display text within the tag
        # "電話で相談 090-7409-0407" → "💬 チャットで相談"
        tag = tag.replace("電話で相談 090-7409-0407", "💬 チャットで相談")
        # "090-7409-0407" standalone → "チャットで相談"
        tag = tag.replace("090-7409-0407", "チャットで相談")
        # "📞 電話" → "💬 チャットで相談"
        tag = tag.replace("📞 電話", "💬 チャットで相談")
        # "📞" alone → "💬"
        tag = tag.replace("📞", "💬")

        if tag != original_tag:
            changes.append(f"  tel: link replaced")
        return tag

    # Match complete <a ...>...</a> tags (non-greedy, possibly multiline)
    content = re.sub(r'<a\b[^>]*>.*?</a>', replace_anchor, content, flags=re.DOTALL)

    # Also handle bare href="tel:..." outside of captured full tags (edge case)
    # Replace any remaining bare tel: hrefs not caught above
    before = content
    content = re.sub(
        r'href="tel:(09074090407|090-7409-0407)"',
        CHAT_ONCLICK,
        content
    )
    if content != before:
        changes.append("  bare tel: href replaced (edge case)")

    if content != original:
        changes.append(f"  [CHANGED] tel links updated")
    else:
        # Check if there were tel: links to begin with
        if re.search(r'tel:(09074090407|090-7409-0407)', original):
            changes.append("  [WARNING] tel: links found but not replaced!")
        else:
            changes.append("  no tel: links found")

    return content, changes


def add_chat_widget(content, filename):
    """Add chat-widget.js script before </body> if not already present."""
    changes = []

    if CHAT_SCRIPT in content:
        changes.append("  chat-widget.js already present (skipped)")
        return content, changes

    if "</body>" not in content:
        changes.append("  [WARNING] no </body> tag found, cannot add script")
        return content, changes

    content = content.replace("</body>", f"  {CHAT_SCRIPT}\n</body>", 1)
    changes.append(f"  chat-widget.js added before </body>")
    return content, changes


def process_file(filename, do_tel, do_widget):
    filepath = os.path.join(BASE_DIR, filename)
    if not os.path.exists(filepath):
        print(f"\n[SKIP] {filename} — file not found")
        return

    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content
    all_changes = []

    if do_tel:
        content, changes = replace_tel_links(content, filename)
        all_changes.extend(changes)

    if do_widget:
        content, changes = add_chat_widget(content, filename)
        all_changes.extend(changes)

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"\n[UPDATED] {filename}")
    else:
        print(f"\n[NO CHANGE] {filename}")

    for c in all_changes:
        print(c)


def main():
    print("=" * 60)
    print("Step 1: Replace tel: links")
    print("=" * 60)
    for filename in TEL_FILES:
        process_file(filename, do_tel=True, do_widget=False)

    print("\n" + "=" * 60)
    print("Step 2: Add chat-widget.js to pages missing it")
    print("=" * 60)
    for filename in NEED_WIDGET:
        process_file(filename, do_tel=False, do_widget=True)

    print("\n" + "=" * 60)
    print("Step 3: Verify — grep for remaining tel: phone links")
    print("=" * 60)
    import subprocess
    result = subprocess.run(
        ["grep", "-rn", "tel:090", "--include=*.html", BASE_DIR],
        capture_output=True, text=True
    )
    if result.stdout:
        print("[WARNING] Remaining tel: links found:")
        print(result.stdout)
    else:
        print("[OK] No remaining tel:090... links found in HTML files.")

    result2 = subprocess.run(
        ["grep", "-rn", "chat-widget.js", "--include=*.html", BASE_DIR],
        capture_output=True, text=True
    )
    print("\nFiles with chat-widget.js:")
    print(result2.stdout)


if __name__ == "__main__":
    main()

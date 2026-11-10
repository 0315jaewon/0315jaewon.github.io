"""Check local navigation and asset paths in the complete Pages artifact."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit

root = Path(__file__).resolve().parents[1] / "_site"
origin = "https://0315jaewon.github.io"
failures = []
checked = set()


class PageLinks(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if value and name in {"href", "src", "action", "poster"}:
                target = urlsplit(urljoin(self.page_url, value.strip()))
                if target.scheme not in {"http", "https"} or target.netloc != "0315jaewon.github.io":
                    continue
                path = root / unquote(target.path).lstrip("/")
                if path.is_dir():
                    path /= "index.html"
                checked.add(target.path)
                if not path.is_file():
                    failures.append(f"{self.page}: {value}")


for page in root.rglob("*.html"):
    parser = PageLinks()
    parser.page = page.relative_to(root).as_posix()
    parser.page_url = f"{origin}/{parser.page}"
    parser.feed(page.read_text())

for route in ["index.html", "AlgVisualizer/algvisualize.html", "gomoku/gomoku.html",
              "Calendar/calendar.html", "testing/index.html", "testing/tasks.js", "testing/tasks.txt",
              "research-planner/index.html", "research-planner/goals/index.html",
              "research-planner/week/index.html", "research-planner/log/index.html"]:
    if not (root / route).is_file():
        failures.append(f"Missing route: {route}")

for path in root.rglob("*"):
    if path.is_file() and (path.suffix in {".php", ".tsx", ".ts"} or path.name.startswith(".env")):
        failures.append(f"Source file should not be published: {path.relative_to(root)}")

if failures:
    raise SystemExit("Pages validation failed:\n" + "\n".join(sorted(set(failures))))
print(f"Passed: all {len(checked)} local links/assets resolve, all website routes exist, and source files are excluded.")

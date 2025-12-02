
import re

file_path = 'd:/side_project/aunt_game/index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix spaces in < div
content = re.sub(r'<\s+div', '<div', content)
content = re.sub(r'</\s+div', '</div', content)

# Fix spaces in ${ }
content = re.sub(r'\$\{\s+', '${', content)
content = re.sub(r'\s+\}', '}', content)

# Fix spaces in style = "
content = re.sub(r'style\s+=\s+"', 'style="', content)

# Fix spaces in >
content = re.sub(r'\s+>', '>', content)

# Specific fix for the penalty line which might have spaces around variable
# feedbackMessage.textContent = `Try again! - ${ penalty } points 📉`;
# The above regexes might handle it, but let's be sure.
content = re.sub(r'\$\{\s*penalty\s*\}', '${penalty}', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed index.html")

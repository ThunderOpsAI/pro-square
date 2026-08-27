import re

with open('src/components/Footer.tsx', 'r') as f:
    content = f.read()

content = content.replace('bg-surface-950 text-surface-400 py-12 bg-herringbone-pattern', 'bg-surface-200 text-surface-600 py-12 bg-hex-pattern')
content = content.replace('border-surface-800', 'border-surface-300')
content = content.replace('text-white', 'text-surface-900')
content = content.replace('hover:text-white', 'hover:text-surface-900')
content = content.replace('text-surface-500', 'text-surface-600')

with open('src/components/Footer.tsx', 'w') as f:
    f.write(content)

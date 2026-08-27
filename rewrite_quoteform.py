import re

with open('src/components/QuoteForm.tsx', 'r') as f:
    content = f.read()

# Replace main section class
content = re.sub(
    r'<section id="quote" className="[^"]+">',
    '<section id="quote" className="py-20 relative overflow-hidden bg-surface-200 text-surface-900 bg-hex-pattern transition-colors duration-500 border-t border-surface-300/30">',
    content
)

# Remove the absolute image overlay
content = re.sub(
    r'\{/\* RICH BACKGROUND IMAGE.*?</div>\s*<div className="max-w-7xl',
    '<div className="max-w-7xl',
    content,
    flags=re.DOTALL
)

# Update Value Proposition colors
content = content.replace('bg-primary-500/20 text-primary-400', 'bg-primary-100 text-primary-700 border-primary-200')
content = content.replace('text-white leading-tight', 'text-surface-900 leading-tight')
content = content.replace('text-surface-300 font-light', 'text-surface-600 font-light')

# Update Feature list
content = content.replace('bg-white/5 border border-white/10', 'bg-white/60 border border-surface-300 shadow-sm')
content = content.replace('text-emerald-400', 'text-emerald-600')
content = content.replace('text-amber-400', 'text-amber-600')
content = content.replace('text-primary-400', 'text-primary-600')
content = content.replace('<h4 className="text-xs font-bold text-white">', '<h4 className="text-xs font-bold text-surface-900">')
content = content.replace('text-[11px] text-surface-400', 'text-[11px] text-surface-600')
content = content.replace('border-t border-white/10', 'border-t border-surface-300/50')
content = content.replace('text-xs text-surface-300', 'text-xs text-surface-600')
content = content.replace('font-bold text-white hover:text-primary-400', 'font-bold text-surface-900 hover:text-primary-600')

# Update Form Container
content = content.replace('bg-surface-900/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative', 'bg-white/80 backdrop-blur-xl border border-surface-300 rounded-3xl p-6 sm:p-8 shadow-xl relative')

# Update Success State
content = content.replace('bg-emerald-500/20 text-emerald-400', 'bg-emerald-100 text-emerald-600')
content = content.replace('border border-emerald-500/40', 'border border-emerald-200')
content = content.replace('text-xl font-bold text-white mb-2', 'text-xl font-bold text-surface-900 mb-2')
content = content.replace('bg-white/10 hover:bg-white/20 text-white', 'bg-surface-900 hover:bg-surface-800 text-white')

# Update Form Fields
content = content.replace('bg-surface-950/80 border text-white text-xs placeholder-surface-500', 'bg-white border text-surface-900 text-xs placeholder-surface-400')
content = content.replace("border-white/10'", "border-surface-300'")
content = content.replace('bg-surface-900', 'bg-white') # For the options

with open('src/components/QuoteForm.tsx', 'w') as f:
    f.write(content)

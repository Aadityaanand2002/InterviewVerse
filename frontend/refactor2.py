import re

with open('/Users/adityamacbookair/Desktop/Interview Platform/frontend/src/pages/SessionPage.jsx', 'r') as f:
    content = f.read()

# 1. Remove drawer wrapping
content = content.replace('<div className="drawer h-screen w-screen bg-mesh overflow-hidden text-base-content relative">\n      <input id="session-sidebar" type="checkbox" className="drawer-toggle" />\n      <div className="drawer-content flex flex-col h-full overflow-hidden relative z-10">\n        <div className="fixed inset-0 grid-pattern pointer-events-none opacity-30" />', '<div className="h-screen w-screen bg-mesh flex flex-col overflow-hidden text-base-content relative">\n      <div className="fixed inset-0 grid-pattern pointer-events-none opacity-30" />')

# 2. Extract Sidebar Content
drawer_side_pattern = re.compile(r'<div className="drawer-side z-\[100\]">.*?<label htmlFor="session-sidebar".*?</label>\n\s*<div className="p-0 w-80 md:w-\[450px\] min-h-full bg-base-100/95 backdrop-blur-3xl text-base-content flex flex-col border-r border-white/10 shadow-2xl">\n(.*?)</div>\n\s*</div>', re.DOTALL)
match = drawer_side_pattern.search(content)

if not match:
    print("Could not find drawer-side")
    exit(1)

problem_content = match.group(1).strip()
content = content[:match.start()] + content[match.end():]

# 3. Remove the extra closing </div> that wrapped drawer-content
content = content.replace('    </main>\n  </div> {/* End of drawer-content */}', '    </main>')

# 4. Rebuild the 3-column layout
code_editor_panel_start = '<Panel defaultSize={45} minSize={30}>\n                  <div className="flex flex-col h-full w-full bg-base-100/30 backdrop-blur-sm rounded-2xl border border-white/10 m-1 shadow-xl overflow-hidden relative">'

three_column_layout = f'''            <Panel defaultSize={{25}} minSize={{20}}>
              {problem_content}
            </Panel>

            <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

            <Panel defaultSize={{50}} minSize={{30}}>
                  <div className="flex flex-col h-full w-full bg-base-100/30 backdrop-blur-sm rounded-2xl border border-white/10 m-1 shadow-xl overflow-hidden relative">'''

if code_editor_panel_start in content:
    content = content.replace(code_editor_panel_start, three_column_layout)
else:
    print("Could not find code_editor_panel_start string!")

# 5. Remove Hamburger Button
hamburger_btn = r'<label htmlFor="session-sidebar".*?</label>\s*'
content = re.sub(hamburger_btn, '', content, flags=re.DOTALL)

with open('/Users/adityamacbookair/Desktop/Interview Platform/frontend/src/pages/SessionPage.jsx', 'w') as f:
    f.write(content)

print("SUCCESS")

import re

with open('/Users/adityamacbookair/Desktop/Interview Platform/frontend/src/pages/SessionPage.jsx', 'r') as f:
    content = f.read()

# 1. We need to extract the Problem Dsc block
start_tag = '<Panel defaultSize={60} minSize={20}>\n                  <div className="h-full flex flex-col bg-base-100/30 backdrop-blur-sm rounded-2xl border border-white/10 m-1 shadow-xl overflow-hidden relative">'

start_idx = content.find(start_tag)
if start_idx == -1:
    print("Could not find start tag")
    exit(1)

# Find the closing tag for the problem panel. It's followed by PanelResizeHandle
end_tag = '</Panel>\n\n                <PanelResizeHandle'
end_idx = content.find(end_tag, start_idx)
if end_idx == -1:
    print("Could not find end tag")
    exit(1)

problem_block = content[start_idx:end_idx]

# Remove the Problem Panel, PanelResizeHandle and PanelGroup vertical wrapper
# Specifically:
# <PanelGroup direction="vertical" className="h-full w-full">
#   [problem_block]
#   </Panel>
#   <PanelResizeHandle ...> ... </PanelResizeHandle>
#   <Panel defaultSize={40} minSize={20}>
#     [CODE EDITOR]
#   </Panel>
# </PanelGroup>

# Let's target the exact string to remove before the Code Editor:
str_to_remove = '<PanelGroup direction="vertical" className="h-full w-full">\n                ' + problem_block + '</Panel>\n\n                <PanelResizeHandle className="h-2 mx-2 my-1 rounded-full bg-white/5 hover:bg-violet-500/50 transition-colors cursor-row-resize flex items-center justify-center">\n                  <div className="w-8 h-1 bg-white/20 rounded-full" />\n                </PanelResizeHandle>\n\n                <Panel defaultSize={40} minSize={20}>\n'

content = content.replace(str_to_remove, '')

# Now remove the closing `</Panel>\n          </PanelGroup>` that wrapped the code editor.
# Wait, the closing tags at the bottom of the left panel:
#               </div>
#             </Panel>
#           </PanelGroup>
#         </div>

# Wait, `</PanelGroup>` was closing the vertical PanelGroup.
# We need to replace `</Panel>\n          </PanelGroup>\n        </div>\n    </main>` with `</Panel>\n        </div>\n    </main>`
content = content.replace('              </div>\n            </Panel>\n          </PanelGroup>\n        </div>\n    </main>', '              </div>\n        </div>\n    </main>')

# 2. Add Hamburger Button to Code Editor Header
code_editor_header_pattern = '''<div className="flex items-center justify-between p-3 bg-[#161b22]/90 backdrop-blur-md border-b border-white/5 shrink-0 relative z-10">
                      <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
                        <button 
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "code" ? "bg-white/10 text-cyan-400 shadow-sm" : "text-base-content/50 hover:text-base-content/80 hover:bg-white/5"}`}'''
code_editor_header_replacement = '''<div className="flex items-center justify-between p-3 bg-[#161b22]/90 backdrop-blur-md border-b border-white/5 shrink-0 relative z-10">
                      <div className="flex items-center gap-2">
                        <label htmlFor="session-sidebar" className="btn btn-square btn-ghost btn-sm mr-2 drawer-button border border-white/10 hover:bg-white/10 text-base-content/70" title="Open Sidebar (Features & Problem Description)">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        </label>
                      <div className="flex items-center gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
                        <button 
                          className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "code" ? "bg-white/10 text-cyan-400 shadow-sm" : "text-base-content/50 hover:text-base-content/80 hover:bg-white/5"}`}'''

content = content.replace(code_editor_header_pattern, code_editor_header_replacement)

# 3. Inject Problem Block into Drawer Side
# Wait, the problem block starts with `<Panel defaultSize={60} minSize={20}>\n                  <div className="h-full flex flex-col bg-base-100/30 backdrop-blur-sm rounded-2xl border border-white/10 m-1 shadow-xl overflow-hidden relative">`
# We need to strip the `<Panel ...>` wrapper from the problem block.
problem_block_inner = problem_block.replace('<Panel defaultSize={60} minSize={20}>\n                  ', '')
# And the Problem block in drawer should take full height.

drawer_injection_target = '{/* Sidebar Content will be moved here */}'
drawer_replacement = problem_block_inner

content = content.replace(drawer_injection_target, drawer_replacement)

with open('/Users/adityamacbookair/Desktop/Interview Platform/frontend/src/pages/SessionPage.jsx', 'w') as f:
    f.write(content)

print("SUCCESS")

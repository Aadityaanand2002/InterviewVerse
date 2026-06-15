import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import Navbar from "../components/Navbar";
import { useProblems, useCreateProblem, useUpdateProblem, useDeleteProblem, useImportLeetCode } from "../hooks/useProblems";
import { PlusIcon, EditIcon, TrashIcon, Loader2Icon, DownloadIcon } from "lucide-react";

const LANGUAGES = ["javascript", "python", "java", "cpp"];

function AdminProblemsPage() {
  const { user, isLoaded } = useUser();
  const { data: problems, isLoading } = useProblems();
  const createMutation = useCreateProblem();
  const updateMutation = useUpdateProblem();
  const deleteMutation = useDeleteProblem();
  const importLeetCodeMutation = useImportLeetCode();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSlug, setImportSlug] = useState("");
  const [editingProblem, setEditingProblem] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // details, publicTests, hiddenTests, code
  const [activeLangTab, setActiveLangTab] = useState("javascript");

  const [formData, setFormData] = useState(null);

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><Loader2Icon className="animate-spin size-8" /></div>;

  const isAdmin = user?.primaryEmailAddress?.emailAddress === "ak8239468@gmail.com";
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const handleOpenModal = (problem = null) => {
    if (problem) {
      setEditingProblem(problem);
      setFormData({ 
        ...problem,
        hiddenTestCode: problem.hiddenTestCode || { javascript: "", python: "", java: "", cpp: "" },
        hiddenExpectedOutput: problem.hiddenExpectedOutput || { javascript: "", python: "", java: "", cpp: "" },
        solutionCode: problem.solutionCode || { javascript: "", python: "", java: "", cpp: "" }
      });
    } else {
      setEditingProblem(null);
      setFormData({
        title: "",
        difficulty: "Easy",
        category: "",
        description: { text: "", notes: [] },
        examples: [],
        hiddenTestCases: [],
        constraints: [],
        starterCode: { javascript: "", python: "", java: "", cpp: "" },
        expectedOutput: { javascript: "", python: "", java: "", cpp: "" },
        hiddenTestCode: { javascript: "", python: "", java: "", cpp: "" },
        hiddenExpectedOutput: { javascript: "", python: "", java: "", cpp: "" },
        solutionCode: { javascript: "", python: "", java: "", cpp: "" }
      });
    }
    setActiveTab("details");
    setActiveLangTab("javascript");
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingProblem) {
      updateMutation.mutate({ id: editingProblem._id, data: formData }, {
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const handleAddExample = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], { input: "", output: "", explanation: "" }]
    });
  };

  const handleRemoveExample = (field, index) => {
    const newArr = [...formData[field]];
    newArr.splice(index, 1);
    setFormData({ ...formData, [field]: newArr });
  };

  const handleExampleChange = (field, index, key, value) => {
    const newArr = [...formData[field]];
    newArr[index][key] = value;
    setFormData({ ...formData, [field]: newArr });
  };

  return (
    <div className="min-h-screen bg-base-300 flex flex-col">
      <Navbar />
      <div className="container mx-auto px-6 py-10 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Question Bank</h1>
          <div className="flex gap-2">
            <button className="btn btn-secondary gap-2" onClick={() => setIsImportModalOpen(true)}>
              <DownloadIcon className="size-5" />
              Import from LeetCode
            </button>
            <button className="btn btn-primary gap-2" onClick={() => handleOpenModal()}>
              <PlusIcon className="size-5" />
              Add Problem
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2Icon className="animate-spin size-8" /></div>
        ) : (
          <div className="bg-base-100 rounded-xl shadow-sm border border-base-300 overflow-hidden">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {problems?.map(p => (
                  <tr key={p._id}>
                    <td className="font-semibold">{p.title}</td>
                    <td>{p.category}</td>
                    <td>
                      <span className={`badge ${p.difficulty === 'Easy' ? 'badge-success' : p.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'}`}>
                        {p.difficulty}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="btn btn-sm btn-ghost" onClick={() => handleOpenModal(p)}><EditIcon className="size-4" /></button>
                      <button className="btn btn-sm btn-ghost text-error" onClick={() => {
                        if(window.confirm('Delete this problem?')) deleteMutation.mutate(p._id);
                      }}><TrashIcon className="size-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && formData && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl h-[90vh] flex flex-col">
            <h3 className="font-bold text-2xl mb-4 shrink-0">{editingProblem ? "Edit Problem" : "Create Problem"}</h3>
            
            <div className="tabs tabs-boxed mb-4 shrink-0">
              <a className={`tab ${activeTab === 'details' ? 'tab-active' : ''}`} onClick={() => setActiveTab('details')}>Details</a>
              <a className={`tab ${activeTab === 'publicTests' ? 'tab-active' : ''}`} onClick={() => setActiveTab('publicTests')}>Public Tests</a>
              <a className={`tab ${activeTab === 'hiddenTests' ? 'tab-active' : ''}`} onClick={() => setActiveTab('hiddenTests')}>Hidden Tests</a>
              <a className={`tab ${activeTab === 'code' ? 'tab-active' : ''}`} onClick={() => setActiveTab('code')}>Execution & Solutions</a>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-4">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="label font-semibold">Title</label>
                    <input type="text" className="input input-bordered w-full" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="label font-semibold">Category</label>
                      <input type="text" className="input input-bordered w-full" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                    </div>
                    <div className="flex-1">
                      <label className="label font-semibold">Difficulty</label>
                      <select className="select select-bordered w-full" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label font-semibold">Description Text</label>
                    <textarea className="textarea textarea-bordered w-full" rows="6" value={formData.description.text} onChange={e => setFormData({...formData, description: { ...formData.description, text: e.target.value }})}></textarea>
                  </div>
                  <div>
                    <label className="label font-semibold">Constraints (one per line)</label>
                    <textarea className="textarea textarea-bordered w-full" rows="3" value={formData.constraints?.join('\n')} onChange={e => setFormData({...formData, constraints: e.target.value.split('\n').filter(c => c.trim() !== '')})}></textarea>
                  </div>
                </div>
              )}

              {activeTab === 'publicTests' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold">Public Examples</h4>
                    <button className="btn btn-sm btn-outline" onClick={() => handleAddExample('examples')}>Add Example</button>
                  </div>
                  {formData.examples.map((ex, i) => (
                    <div key={i} className="p-4 border border-base-300 rounded-lg relative">
                      <button className="btn btn-xs btn-error absolute top-2 right-2" onClick={() => handleRemoveExample('examples', i)}>Remove</button>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <label className="text-xs font-semibold">Input</label>
                          <input type="text" className="input input-bordered input-sm w-full" value={ex.input} onChange={e => handleExampleChange('examples', i, 'input', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold">Output</label>
                          <input type="text" className="input input-bordered input-sm w-full" value={ex.output} onChange={e => handleExampleChange('examples', i, 'output', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold">Explanation</label>
                        <input type="text" className="input input-bordered input-sm w-full" value={ex.explanation} onChange={e => handleExampleChange('examples', i, 'explanation', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'hiddenTests' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold">Hidden Test Cases (Descriptive only)</h4>
                    <button className="btn btn-sm btn-outline" onClick={() => handleAddExample('hiddenTestCases')}>Add Hidden Test</button>
                  </div>
                  <p className="text-sm text-base-content/70">These are shown as bullet points or just stored in DB. Actual execution requires setting the Execution Code in the next tab.</p>
                  {formData.hiddenTestCases.map((ex, i) => (
                    <div key={i} className="p-4 border border-base-300 rounded-lg relative">
                      <button className="btn btn-xs btn-error absolute top-2 right-2" onClick={() => handleRemoveExample('hiddenTestCases', i)}>Remove</button>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <label className="text-xs font-semibold">Input</label>
                          <input type="text" className="input input-bordered input-sm w-full" value={ex.input} onChange={e => handleExampleChange('hiddenTestCases', i, 'input', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold">Output</label>
                          <input type="text" className="input input-bordered input-sm w-full" value={ex.output} onChange={e => handleExampleChange('hiddenTestCases', i, 'output', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold">Explanation (Optional)</label>
                        <input type="text" className="input input-bordered input-sm w-full" value={ex.explanation || ''} onChange={e => handleExampleChange('hiddenTestCases', i, 'explanation', e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'code' && (
                <div className="flex flex-col h-full">
                  <div className="tabs tabs-bordered mb-4">
                    {LANGUAGES.map(lang => (
                      <a key={lang} className={`tab ${activeLangTab === lang ? 'tab-active' : ''}`} onClick={() => setActiveLangTab(lang)}>
                        {lang.toUpperCase()}
                      </a>
                    ))}
                  </div>
                  
                  <div className="space-y-6">
                    {/* Starter Code */}
                    <div>
                      <label className="label font-semibold">Starter Code (Includes Public Tests)</label>
                      <textarea className="textarea textarea-bordered w-full font-mono text-sm" rows="6" 
                        value={formData.starterCode[activeLangTab]} 
                        onChange={e => setFormData({...formData, starterCode: { ...formData.starterCode, [activeLangTab]: e.target.value }})}
                        placeholder={`Code that candidate sees initially...`}
                      ></textarea>
                    </div>

                    {/* Expected Output */}
                    <div>
                      <label className="label font-semibold">Expected Output (Public Tests stdout)</label>
                      <textarea className="textarea textarea-bordered w-full font-mono text-sm" rows="2" 
                        value={formData.expectedOutput[activeLangTab]} 
                        onChange={e => setFormData({...formData, expectedOutput: { ...formData.expectedOutput, [activeLangTab]: e.target.value }})}
                        placeholder="Exact stdout string to match"
                      ></textarea>
                    </div>

                    <div className="divider">HIDDEN TESTS CONFIGURATION</div>

                    {/* Hidden Test Code */}
                    <div>
                      <label className="label font-semibold text-warning">Hidden Test Execution Code</label>
                      <p className="text-xs mb-2">This code is appended to the candidate's code when they click "Submit" to run hidden tests.</p>
                      <textarea className="textarea textarea-bordered w-full font-mono text-sm border-warning" rows="6" 
                        value={formData.hiddenTestCode[activeLangTab]} 
                        onChange={e => setFormData({...formData, hiddenTestCode: { ...formData.hiddenTestCode, [activeLangTab]: e.target.value }})}
                        placeholder={`console.log(twoSum([3,3], 6));`}
                      ></textarea>
                    </div>

                    {/* Hidden Expected Output */}
                    <div>
                      <label className="label font-semibold text-warning">Expected Output (Hidden Tests stdout)</label>
                      <textarea className="textarea textarea-bordered w-full font-mono text-sm border-warning" rows="2" 
                        value={formData.hiddenExpectedOutput[activeLangTab]} 
                        onChange={e => setFormData({...formData, hiddenExpectedOutput: { ...formData.hiddenExpectedOutput, [activeLangTab]: e.target.value }})}
                        placeholder="Exact stdout string to match for hidden tests"
                      ></textarea>
                    </div>

                    <div className="divider">OFFICIAL SOLUTION</div>

                    {/* Solution Code */}
                    <div>
                      <label className="label font-semibold text-success">Solution Code</label>
                      <textarea className="textarea textarea-bordered w-full font-mono text-sm border-success" rows="6" 
                        value={formData.solutionCode[activeLangTab]} 
                        onChange={e => setFormData({...formData, solutionCode: { ...formData.solutionCode, [activeLangTab]: e.target.value }})}
                        placeholder="Optimal solution implementation..."
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-action shrink-0 border-t border-base-300 pt-4">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? <Loader2Icon className="animate-spin size-4 mr-2" /> : null}
                Save Problem
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}></div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Import from LeetCode</h3>
            <p className="py-4 text-sm text-base-content/70">
              Paste the full LeetCode problem URL or the exact slug.
              <br/>
              <a href="https://leetcode.com/problemset/all/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-2 inline-block">
                Browse LeetCode Problems ↗
              </a>
            </p>
            <input 
              type="text" 
              placeholder="e.g. https://leetcode.com/problems/two-sum/ or just 'two-sum'" 
              className="input input-bordered w-full"
              value={importSlug}
              onChange={e => setImportSlug(e.target.value)}
            />
            <div className="modal-action">
              <button className="btn" onClick={() => setIsImportModalOpen(false)}>Cancel</button>
              <button 
                className="btn btn-primary" 
                disabled={!importSlug || importLeetCodeMutation.isPending}
                onClick={() => {
                  // Extract slug if user pasted a full URL
                  let finalSlug = importSlug.trim();
                  if (finalSlug.includes('leetcode.com/problems/')) {
                    try {
                      const url = new URL(finalSlug.startsWith('http') ? finalSlug : `https://${finalSlug}`);
                      const parts = url.pathname.split('/');
                      const problemsIndex = parts.indexOf('problems');
                      if (problemsIndex !== -1 && parts.length > problemsIndex + 1) {
                        finalSlug = parts[problemsIndex + 1];
                      }
                    } catch (e) {
                      // Fallback to basic string manipulation if URL parsing fails
                      finalSlug = finalSlug.split('leetcode.com/problems/')[1].split('/')[0];
                    }
                  }

                  importLeetCodeMutation.mutate(finalSlug, {
                    onSuccess: (data) => {
                      setIsImportModalOpen(false);
                      setImportSlug("");
                      if (data?.data) {
                        setEditingProblem(null);
                        setFormData({
                          ...data.data,
                          hiddenTestCode: { javascript: "", python: "", java: "", cpp: "" },
                          hiddenExpectedOutput: { javascript: "", python: "", java: "", cpp: "" },
                          solutionCode: { javascript: "", python: "", java: "", cpp: "" }
                        });
                        setActiveTab("details");
                        setIsModalOpen(true);
                      }
                    }
                  });
                }}
              >
                {importLeetCodeMutation.isPending ? <Loader2Icon className="animate-spin size-4" /> : "Fetch"}
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setIsImportModalOpen(false)}></div>
        </div>
      )}
    </div>
  );
}

export default AdminProblemsPage;

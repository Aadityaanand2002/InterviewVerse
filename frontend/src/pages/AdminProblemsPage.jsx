import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router";
import Navbar from "../components/Navbar";
import { useProblems, useCreateProblem, useUpdateProblem, useDeleteProblem, useImportLeetCode } from "../hooks/useProblems";
import { PlusIcon, EditIcon, TrashIcon, Loader2Icon, DownloadIcon } from "lucide-react";

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

  // Form state
  const [formData, setFormData] = useState(null);

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><Loader2Icon className="animate-spin size-8" /></div>;

  // Simple auth check for admin (we use ak8239468@gmail.com)
  const isAdmin = user?.primaryEmailAddress?.emailAddress === "ak8239468@gmail.com";
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  const handleOpenModal = (problem = null) => {
    if (problem) {
      setEditingProblem(problem);
      setFormData({ ...problem });
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
        starterCode: { javascript: "", python: "", java: "" },
        expectedOutput: { javascript: "", python: "", java: "" }
      });
    }
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

  return (
    <div className="min-h-screen bg-base-300">
      <Navbar />
      <div className="container mx-auto px-6 py-10">
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

      {/* Simple Modal for Demo */}
      {isModalOpen && formData && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-2xl mb-4">{editingProblem ? "Edit Problem" : "Create Problem"}</h3>
            
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
                <textarea className="textarea textarea-bordered w-full" rows="3" value={formData.description.text} onChange={e => setFormData({...formData, description: { ...formData.description, text: e.target.value }})}></textarea>
              </div>

              {/* JS Starter Code (simplified for admin panel demo) */}
              <div>
                <label className="label font-semibold">JavaScript Starter Code</label>
                <textarea className="textarea textarea-bordered w-full font-mono text-sm" rows="5" value={formData.starterCode.javascript} onChange={e => setFormData({...formData, starterCode: { ...formData.starterCode, javascript: e.target.value }})}></textarea>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
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
            <p className="py-4 text-sm text-base-content/70">Enter the LeetCode problem slug (e.g., "two-sum", "reverse-linked-list").</p>
            <input 
              type="text" 
              placeholder="Problem slug" 
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
                  importLeetCodeMutation.mutate(importSlug, {
                    onSuccess: (data) => {
                      setIsImportModalOpen(false);
                      setImportSlug("");
                      // Open edit modal with imported data
                      if (data?.data) {
                        setEditingProblem(null); // Treat as new
                        setFormData(data.data);
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

import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { useToast } from '../../context/ToastContext';

import { Award, Plus } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export function AdminSkillsPage() {
  const toast = useToast();
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Category
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // New Skill
  const [skillName, setSkillName] = useState('');
  const [skillCatId, setSkillCatId] = useState('');
  const [skillRel, setSkillRel] = useState('high');
  const [skillDesc, setSkillDesc] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [skList, catList] = await Promise.all([
        api.get('/skills'),
        api.get('/skills/categories'),
      ]);
      setSkills(skList);
      setCategories(catList);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post('/skills/categories', { name: catName, description: catDesc });
      setCatName('');
      setCatDesc('');
      fetchData();
      toast.success('Skill category created.');
    } catch (err) {
      toast.error('Error creating category: ' + err.message);
    }
  };

  const handleCreateSkill = async (e) => {
    e.preventDefault();
    try {
      await api.post('/skills', {
        name: skillName,
        category_id: skillCatId ? parseInt(skillCatId) : null,
        industry_relevance: skillRel,
        description: skillDesc,
      });
      setSkillName('');
      setSkillCatId('');
      setSkillDesc('');
      fetchData();
      toast.success(`Skill '${skillName}' registered in ontology.`);
    } catch (err) {
      toast.error('Error creating skill: ' + err.message);
    }
  };

  return (
    <PortalLayout title="Skill Taxonomy & Ontology Management" allowedRoles={['admin']}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        {/* Skills List */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Standardized Skill Catalog</h3>
            <span className="badge badge-info">{skills.length} Registered Skills</span>
          </div>

          {loading ? (
            <LoadingSpinner message="Loading skill taxonomy..." />
          ) : skills.length === 0 ? (
            <p className="text-muted" style={{ padding: '24px 0' }}>No skills in the catalog yet. Populate categories and skills using the authoring forms.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Skill Name</th>
                    <th>Category</th>
                    <th>Industry Relevance</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.category?.name || 'General'}</td>
                      <td>
                        <span className={`badge ${s.industry_relevance === 'high' ? 'badge-success' : s.industry_relevance === 'emerging' ? 'badge-info' : 'badge-neutral'}`}>
                          {s.industry_relevance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Authoring Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Add Category */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <h3 className="card-title">Add Skill Category</h3>
            </div>
            <form onSubmit={handleCreateCategory}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input type="text" className="form-control" placeholder="e.g. Clinical Research, Data Science" value={catName} onChange={(e) => setCatName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" className="form-control" value={catDesc} onChange={(e) => setCatDesc(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                <Plus size={13} /> Create Category
              </button>
            </form>
          </div>

          {/* Add Skill */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header">
              <h3 className="card-title">Add Catalog Skill</h3>
            </div>
            <form onSubmit={handleCreateSkill}>
              <div className="form-group">
                <label className="form-label">Skill Name *</label>
                <input type="text" className="form-control" placeholder="e.g. Pharmacovigilance / Python" value={skillName} onChange={(e) => setSkillName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Assign Category</label>
                <select className="form-control" value={skillCatId} onChange={(e) => setSkillCatId(e.target.value)}>
                  <option value="">-- Select Category --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Market Relevance</label>
                <select className="form-control" value={skillRel} onChange={(e) => setSkillRel(e.target.value)}>
                  <option value="high">High Demand</option>
                  <option value="emerging">Emerging / Future</option>
                  <option value="medium">Medium Demand</option>
                </select>
              </div>
              <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                <Plus size={13} /> Register Skill
              </button>
            </form>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

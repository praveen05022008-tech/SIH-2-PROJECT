import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PortalLayout } from '../../components/layout/PortalLayout';
import { Briefcase, GraduationCap } from 'lucide-react';

export function InstitutionPlacementsPage() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/internships')
      .then((data) => setInternships(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PortalLayout title="Placement & Internship Records" allowedRoles={['institution']}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Institutional Student Placements & Internships</h3>
            <p className="text-muted" style={{ fontSize: '12px' }}>Real-time cohort participation across partner industries</p>
          </div>
          <span className="badge badge-success">{internships.length} Active Placements</span>
        </div>

        {loading ? (
          <p className="text-muted">Loading placement records...</p>
        ) : internships.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0' }}>
            <Briefcase size={36} color="#94A3B8" style={{ margin: '0 auto 12px' }} />
            <p className="text-muted">No student placement or internship participation records found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Opportunity Title</th>
                  <th>Industry Partner</th>
                  <th>Status</th>
                  <th>Milestones Assigned</th>
                  <th>Final Grade</th>
                </tr>
              </thead>
              <tbody>
                {internships.map((i) => (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 600 }}>{i.student_name}</td>
                    <td>{i.opportunity_title}</td>
                    <td>{i.company_name}</td>
                    <td><span className="badge badge-success">{i.status}</span></td>
                    <td>{i.tasks?.length || 0} Tasks</td>
                    <td>{i.final_grade || 'In Progress'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

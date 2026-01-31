import type { AssessmentData } from '../assessment-data'
import { getString, getBool } from '../assessment-data'
import { wrapHtml, escapeHtml } from './index'

export function generateRiskTreatmentPlan(data: AssessmentData): string {
  const orgName = data.workspaceName
  const sponsor = getString(data, 'lead_sponsor')

  // Generate treatment actions based on assessment gaps
  const treatments: { risk: string; action: string; priority: string; owner: string; status: string }[] = []

  if (!getBool(data, 'ctrl_access_mfa')) {
    treatments.push({
      risk: 'Unauthorized Access - No MFA',
      action: 'Implement multi-factor authentication for all user accounts',
      priority: 'High',
      owner: 'IT Team',
      status: 'Planned'
    })
  }

  if (!getBool(data, 'ctrl_access_sso')) {
    treatments.push({
      risk: 'Credential Management - No SSO',
      action: 'Deploy Single Sign-On solution for centralized authentication',
      priority: 'Medium',
      owner: 'IT Team',
      status: 'Planned'
    })
  }

  if (!getBool(data, 'ctrl_endpoint_encrypt')) {
    treatments.push({
      risk: 'Data Loss - Unencrypted Devices',
      action: 'Enable full disk encryption on all endpoints',
      priority: 'High',
      owner: 'IT Team',
      status: 'Planned'
    })
  }

  if (!getBool(data, 'ctrl_endpoint_mdm')) {
    treatments.push({
      risk: 'Unmanaged Endpoints',
      action: 'Implement MDM/EDR solution for endpoint management',
      priority: 'Medium',
      owner: 'IT Team',
      status: 'Planned'
    })
  }

  if (!getBool(data, 'ctrl_backup_exists')) {
    treatments.push({
      risk: 'Data Loss - No Backups',
      action: 'Implement automated backup procedures for critical data',
      priority: 'Critical',
      owner: 'IT Team',
      status: 'Planned'
    })
  }

  if (!getBool(data, 'ctrl_backup_tested')) {
    treatments.push({
      risk: 'Recovery Failure - Untested Backups',
      action: 'Establish quarterly backup restoration testing',
      priority: 'Medium',
      owner: 'IT Team',
      status: 'Planned'
    })
  }

  if (!getBool(data, 'ctrl_logging')) {
    treatments.push({
      risk: 'Undetected Breaches - No Logging',
      action: 'Deploy centralized logging and SIEM solution',
      priority: 'High',
      owner: 'IT Team',
      status: 'Planned'
    })
  }

  if (!getBool(data, 'ctrl_vuln_scanning')) {
    treatments.push({
      risk: 'Unpatched Vulnerabilities',
      action: 'Implement regular vulnerability scanning and patching',
      priority: 'High',
      owner: 'IT Team',
      status: 'Planned'
    })
  }

  if (!getBool(data, 'ops_incident_process')) {
    treatments.push({
      risk: 'Ineffective Incident Response',
      action: 'Develop and document incident response procedures',
      priority: 'High',
      owner: 'Security Lead',
      status: 'Planned'
    })
  }

  if (!getBool(data, 'ops_training')) {
    treatments.push({
      risk: 'Security Awareness Gap',
      action: 'Implement security awareness training program',
      priority: 'Medium',
      owner: 'Security Lead',
      status: 'Planned'
    })
  }

  if (treatments.length === 0) {
    treatments.push({
      risk: 'Continuous Improvement',
      action: 'Monitor and maintain existing security controls',
      priority: 'Low',
      owner: 'Security Lead',
      status: 'Ongoing'
    })
  }

  const content = `
    <h2>1. Purpose</h2>
    <p>This Risk Treatment Plan outlines the actions required to address identified risks for <strong>${escapeHtml(orgName)}</strong>.</p>

    <h2>2. Treatment Approach</h2>
    <p>Risks are treated using one of the following approaches:</p>
    <ul>
      <li><strong>Mitigate:</strong> Implement controls to reduce likelihood or impact</li>
      <li><strong>Transfer:</strong> Share risk through insurance or third parties</li>
      <li><strong>Avoid:</strong> Eliminate the activity causing the risk</li>
      <li><strong>Accept:</strong> Accept residual risk when within tolerance</li>
    </ul>

    <h2>3. Treatment Actions</h2>
    <table>
      <tr>
        <th>Risk</th>
        <th>Treatment Action</th>
        <th>Priority</th>
        <th>Owner</th>
        <th>Status</th>
      </tr>
      ${treatments.map(t => `
      <tr>
        <td>${escapeHtml(t.risk)}</td>
        <td>${escapeHtml(t.action)}</td>
        <td>${t.priority}</td>
        <td>${escapeHtml(t.owner)}</td>
        <td>${t.status}</td>
      </tr>
      `).join('')}
    </table>

    <h2>4. Priority Definitions</h2>
    <table>
      <tr>
        <th>Priority</th>
        <th>Timeline</th>
        <th>Description</th>
      </tr>
      <tr>
        <td>Critical</td>
        <td>Immediate</td>
        <td>Must be addressed within 30 days</td>
      </tr>
      <tr>
        <td>High</td>
        <td>Short-term</td>
        <td>Must be addressed within 90 days</td>
      </tr>
      <tr>
        <td>Medium</td>
        <td>Mid-term</td>
        <td>Should be addressed within 6 months</td>
      </tr>
      <tr>
        <td>Low</td>
        <td>Long-term</td>
        <td>Address within 12 months</td>
      </tr>
    </table>

    <h2>5. Progress Tracking</h2>
    <table>
      <tr>
        <th>Priority</th>
        <th>Total</th>
        <th>Planned</th>
        <th>In Progress</th>
        <th>Complete</th>
      </tr>
      <tr>
        <td>Critical</td>
        <td>${treatments.filter(t => t.priority === 'Critical').length}</td>
        <td>${treatments.filter(t => t.priority === 'Critical' && t.status === 'Planned').length}</td>
        <td>0</td>
        <td>0</td>
      </tr>
      <tr>
        <td>High</td>
        <td>${treatments.filter(t => t.priority === 'High').length}</td>
        <td>${treatments.filter(t => t.priority === 'High' && t.status === 'Planned').length}</td>
        <td>0</td>
        <td>0</td>
      </tr>
      <tr>
        <td>Medium</td>
        <td>${treatments.filter(t => t.priority === 'Medium').length}</td>
        <td>${treatments.filter(t => t.priority === 'Medium' && t.status === 'Planned').length}</td>
        <td>0</td>
        <td>0</td>
      </tr>
      <tr>
        <td>Low</td>
        <td>${treatments.filter(t => t.priority === 'Low').length}</td>
        <td>${treatments.filter(t => t.priority === 'Low' && t.status === 'Planned').length}</td>
        <td>0</td>
        <td>0</td>
      </tr>
    </table>

    <h2>6. Review & Approval</h2>
    <table>
      <tr>
        <td><strong>Approved By:</strong></td>
        <td>${escapeHtml(sponsor)}</td>
      </tr>
      <tr>
        <td><strong>Date:</strong></td>
        <td>${data.generatedDate}</td>
      </tr>
      <tr>
        <td><strong>Next Review:</strong></td>
        <td>Within 90 days</td>
      </tr>
    </table>
  `

  return wrapHtml('Risk Treatment Plan', content, orgName, data.generatedDate)
}

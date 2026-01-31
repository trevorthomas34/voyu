import type { AssessmentData } from '../assessment-data'
import { getString, getBool } from '../assessment-data'
import { wrapHtml, escapeHtml } from './index'

export function generateImplementationChecklist(data: AssessmentData): string {
  const orgName = data.workspaceName
  const sponsor = getString(data, 'lead_sponsor')

  // Build checklist based on assessment answers
  const items: { category: string; item: string; status: string; priority: string }[] = [
    // Leadership & Governance
    {
      category: 'Leadership & Governance',
      item: 'Appoint executive sponsor for ISMS',
      status: getString(data, 'lead_sponsor') !== '[Not provided]' ? 'Done' : 'To Do',
      priority: 'High'
    },
    {
      category: 'Leadership & Governance',
      item: 'Assign dedicated security role',
      status: getBool(data, 'lead_security_role') ? 'Done' : 'To Do',
      priority: 'High'
    },
    {
      category: 'Leadership & Governance',
      item: 'Allocate security budget',
      status: getBool(data, 'lead_budget') ? 'Done' : 'To Do',
      priority: 'Medium'
    },
    {
      category: 'Leadership & Governance',
      item: 'Document security policies',
      status: getBool(data, 'lead_policies_exist') ? 'Done' : 'To Do',
      priority: 'High'
    },

    // Risk Management
    {
      category: 'Risk Management',
      item: 'Conduct formal risk assessment',
      status: getBool(data, 'risk_assessment_done') ? 'Done' : 'To Do',
      priority: 'High'
    },
    {
      category: 'Risk Management',
      item: 'Create and maintain risk register',
      status: getBool(data, 'risk_assessment_done') ? 'Done' : 'To Do',
      priority: 'High'
    },

    // Access Control
    {
      category: 'Access Control',
      item: 'Implement Single Sign-On (SSO)',
      status: getBool(data, 'ctrl_access_sso') ? 'Done' : 'To Do',
      priority: 'Medium'
    },
    {
      category: 'Access Control',
      item: 'Enable Multi-Factor Authentication (MFA)',
      status: getBool(data, 'ctrl_access_mfa') ? 'Done' : 'To Do',
      priority: 'High'
    },
    {
      category: 'Access Control',
      item: 'Implement access review process',
      status: getBool(data, 'ctrl_access_review') ? 'Done' : 'To Do',
      priority: 'Medium'
    },

    // Endpoint Security
    {
      category: 'Endpoint Security',
      item: 'Deploy endpoint management (MDM/EDR)',
      status: getBool(data, 'ctrl_endpoint_mdm') ? 'Done' : 'To Do',
      priority: 'Medium'
    },
    {
      category: 'Endpoint Security',
      item: 'Enable device encryption',
      status: getBool(data, 'ctrl_endpoint_encrypt') ? 'Done' : 'To Do',
      priority: 'High'
    },

    // Data Protection
    {
      category: 'Data Protection',
      item: 'Implement data classification scheme',
      status: getBool(data, 'ctrl_data_classification') ? 'Done' : 'To Do',
      priority: 'Medium'
    },
    {
      category: 'Data Protection',
      item: 'Enable encryption at rest and in transit',
      status: getBool(data, 'ctrl_data_encryption') ? 'Done' : 'To Do',
      priority: 'High'
    },
    {
      category: 'Data Protection',
      item: 'Implement backup procedures',
      status: getBool(data, 'ctrl_backup_exists') ? 'Done' : 'To Do',
      priority: 'High'
    },
    {
      category: 'Data Protection',
      item: 'Test backup restoration',
      status: getBool(data, 'ctrl_backup_tested') ? 'Done' : 'To Do',
      priority: 'Medium'
    },

    // Security Monitoring
    {
      category: 'Security Monitoring',
      item: 'Implement centralized logging',
      status: getBool(data, 'ctrl_logging') ? 'Done' : 'To Do',
      priority: 'High'
    },
    {
      category: 'Security Monitoring',
      item: 'Deploy vulnerability scanning',
      status: getBool(data, 'ctrl_vuln_scanning') ? 'Done' : 'To Do',
      priority: 'High'
    },
    {
      category: 'Security Monitoring',
      item: 'Conduct penetration testing',
      status: getBool(data, 'ctrl_pentest') ? 'Done' : 'To Do',
      priority: 'Medium'
    },
    {
      category: 'Security Monitoring',
      item: 'Enable anomaly monitoring',
      status: getBool(data, 'ops_monitoring') ? 'Done' : 'To Do',
      priority: 'Medium'
    },

    // Operations
    {
      category: 'Operations',
      item: 'Implement change management process',
      status: getBool(data, 'ops_change_mgmt') ? 'Done' : 'To Do',
      priority: 'Medium'
    },
    {
      category: 'Operations',
      item: 'Create incident response process',
      status: getBool(data, 'ops_incident_process') ? 'Done' : 'To Do',
      priority: 'High'
    },
    {
      category: 'Operations',
      item: 'Deliver security awareness training',
      status: getBool(data, 'ops_training') ? 'Done' : 'To Do',
      priority: 'High'
    },
    {
      category: 'Operations',
      item: 'Establish security review process',
      status: getBool(data, 'ops_review_process') ? 'Done' : 'To Do',
      priority: 'Medium'
    },
  ]

  const doneCount = items.filter(i => i.status === 'Done').length
  const todoCount = items.filter(i => i.status === 'To Do').length
  const totalCount = items.length
  const progressPercent = Math.round((doneCount / totalCount) * 100)

  const categories = [...new Set(items.map(i => i.category))]

  const content = `
    <h2>1. Overview</h2>
    <p>This checklist tracks the implementation progress of ISO 27001 controls for <strong>${escapeHtml(orgName)}</strong>.</p>

    <h2>2. Progress Summary</h2>
    <table>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Completed Items</td>
        <td>${doneCount}</td>
      </tr>
      <tr>
        <td>Pending Items</td>
        <td>${todoCount}</td>
      </tr>
      <tr>
        <td>Total Items</td>
        <td>${totalCount}</td>
      </tr>
      <tr>
        <td><strong>Progress</strong></td>
        <td><strong>${progressPercent}%</strong></td>
      </tr>
    </table>

    <h2>3. Implementation Checklist</h2>
    ${categories.map(category => `
    <h3>${escapeHtml(category)}</h3>
    <table>
      <tr>
        <th>Item</th>
        <th>Priority</th>
        <th>Status</th>
      </tr>
      ${items.filter(i => i.category === category).map(item => `
      <tr>
        <td>${escapeHtml(item.item)}</td>
        <td>${item.priority}</td>
        <td class="${item.status === 'Done' ? 'status-yes' : 'status-no'}">${item.status}</td>
      </tr>
      `).join('')}
    </table>
    `).join('')}

    <h2>4. Priority Legend</h2>
    <ul>
      <li><strong>High:</strong> Required for certification, address immediately</li>
      <li><strong>Medium:</strong> Important for compliance, address within 3 months</li>
      <li><strong>Low:</strong> Recommended, address within 6 months</li>
    </ul>

    <h2>5. Next Steps</h2>
    <ol>
      <li>Address all High priority items marked "To Do"</li>
      <li>Schedule implementation for Medium priority items</li>
      <li>Conduct internal audit once 80% complete</li>
      <li>Engage certification body for Stage 1 audit</li>
    </ol>

    <h2>6. Document Control</h2>
    <table>
      <tr>
        <td><strong>Owner:</strong></td>
        <td>${escapeHtml(sponsor)}</td>
      </tr>
      <tr>
        <td><strong>Last Updated:</strong></td>
        <td>${data.generatedDate}</td>
      </tr>
    </table>
  `

  return wrapHtml('Implementation Checklist', content, orgName, data.generatedDate)
}

import type { AssessmentData } from '../assessment-data'
import { getString, getBool, getYesNo } from '../assessment-data'
import { wrapHtml, escapeHtml } from './index'

export function generateSoaLite(data: AssessmentData): string {
  const orgName = data.workspaceName
  const sponsor = getString(data, 'lead_sponsor')

  // Map controls to assessment answers
  const controls: { id: string; name: string; applicable: string; implemented: string; justification: string }[] = [
    {
      id: 'A.5.1',
      name: 'Policies for information security',
      applicable: 'Yes',
      implemented: getYesNo(data, 'lead_policies_exist'),
      justification: 'Required for ISMS governance'
    },
    {
      id: 'A.5.2',
      name: 'Information security roles and responsibilities',
      applicable: 'Yes',
      implemented: getBool(data, 'lead_security_role') ? 'Yes' : 'No',
      justification: 'Required for accountability'
    },
    {
      id: 'A.5.15',
      name: 'Access control',
      applicable: 'Yes',
      implemented: getBool(data, 'ctrl_access_mfa') || getBool(data, 'ctrl_access_sso') ? 'Partial' : 'No',
      justification: 'Required for data protection'
    },
    {
      id: 'A.5.17',
      name: 'Authentication information',
      applicable: 'Yes',
      implemented: getYesNo(data, 'ctrl_access_mfa'),
      justification: 'Required for access security'
    },
    {
      id: 'A.5.23',
      name: 'Information security for cloud services',
      applicable: getBool(data, 'risk_vendors') ? 'Yes' : 'N/A',
      implemented: getYesNo(data, 'ctrl_cloud_security'),
      justification: getBool(data, 'risk_vendors') ? 'Cloud services in use' : 'No cloud services'
    },
    {
      id: 'A.5.24',
      name: 'Incident management planning',
      applicable: 'Yes',
      implemented: getYesNo(data, 'ops_incident_process'),
      justification: 'Required for incident response'
    },
    {
      id: 'A.5.29',
      name: 'Information security during disruption',
      applicable: 'Yes',
      implemented: getYesNo(data, 'ctrl_backup_exists'),
      justification: 'Required for business continuity'
    },
    {
      id: 'A.6.3',
      name: 'Information security awareness and training',
      applicable: 'Yes',
      implemented: getYesNo(data, 'ops_training'),
      justification: 'Required for all personnel'
    },
    {
      id: 'A.8.1',
      name: 'User endpoint devices',
      applicable: 'Yes',
      implemented: getBool(data, 'ctrl_endpoint_mdm') && getBool(data, 'ctrl_endpoint_encrypt') ? 'Yes' : 'Partial',
      justification: 'Required for endpoint security'
    },
    {
      id: 'A.8.5',
      name: 'Secure authentication',
      applicable: 'Yes',
      implemented: getYesNo(data, 'ctrl_access_mfa'),
      justification: 'Required for access control'
    },
    {
      id: 'A.8.9',
      name: 'Configuration management',
      applicable: 'Yes',
      implemented: getYesNo(data, 'ops_change_mgmt'),
      justification: 'Required for system integrity'
    },
    {
      id: 'A.8.13',
      name: 'Information backup',
      applicable: 'Yes',
      implemented: getBool(data, 'ctrl_backup_exists') && getBool(data, 'ctrl_backup_tested') ? 'Yes' : getYesNo(data, 'ctrl_backup_exists'),
      justification: 'Required for data recovery'
    },
    {
      id: 'A.8.15',
      name: 'Logging',
      applicable: 'Yes',
      implemented: getYesNo(data, 'ctrl_logging'),
      justification: 'Required for security monitoring'
    },
    {
      id: 'A.8.16',
      name: 'Monitoring activities',
      applicable: 'Yes',
      implemented: getYesNo(data, 'ops_monitoring'),
      justification: 'Required for threat detection'
    },
    {
      id: 'A.8.24',
      name: 'Use of cryptography',
      applicable: 'Yes',
      implemented: getYesNo(data, 'ctrl_data_encryption'),
      justification: 'Required for data protection'
    },
  ]

  const yesCount = controls.filter(c => c.implemented === 'Yes').length
  const partialCount = controls.filter(c => c.implemented === 'Partial').length
  const noCount = controls.filter(c => c.implemented === 'No').length
  const naCount = controls.filter(c => c.applicable === 'N/A').length

  const content = `
    <h2>1. Purpose</h2>
    <p>This Statement of Applicability (Lite) documents the applicability and implementation status of core ISO 27001:2022 Annex A controls for <strong>${escapeHtml(orgName)}</strong>.</p>

    <h2>2. Summary</h2>
    <table>
      <tr>
        <th>Status</th>
        <th>Count</th>
      </tr>
      <tr>
        <td class="status-yes">Implemented</td>
        <td>${yesCount}</td>
      </tr>
      <tr>
        <td>Partial</td>
        <td>${partialCount}</td>
      </tr>
      <tr>
        <td class="status-no">Not Implemented</td>
        <td>${noCount}</td>
      </tr>
      <tr>
        <td class="status-na">Not Applicable</td>
        <td>${naCount}</td>
      </tr>
    </table>

    <h2>3. Control Applicability Matrix</h2>
    <table>
      <tr>
        <th>Control ID</th>
        <th>Control Name</th>
        <th>Applicable</th>
        <th>Implemented</th>
        <th>Justification</th>
      </tr>
      ${controls.map(c => `
      <tr>
        <td>${c.id}</td>
        <td>${escapeHtml(c.name)}</td>
        <td>${c.applicable}</td>
        <td class="${c.implemented === 'Yes' ? 'status-yes' : c.implemented === 'No' ? 'status-no' : ''}">${c.implemented}</td>
        <td>${escapeHtml(c.justification)}</td>
      </tr>
      `).join('')}
    </table>

    <h2>4. Notes</h2>
    <ul>
      <li>This is a simplified SoA covering 15 core controls</li>
      <li>Full ISO 27001:2022 Annex A includes 93 controls across 4 themes</li>
      <li>Additional controls should be assessed during formal certification</li>
    </ul>

    <h2>5. Document Control</h2>
    <table>
      <tr>
        <td><strong>Approved By:</strong></td>
        <td>${escapeHtml(sponsor)}</td>
      </tr>
      <tr>
        <td><strong>Date:</strong></td>
        <td>${data.generatedDate}</td>
      </tr>
    </table>
  `

  return wrapHtml('Statement of Applicability (Lite)', content, orgName, data.generatedDate)
}

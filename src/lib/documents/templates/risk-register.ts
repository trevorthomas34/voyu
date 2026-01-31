import type { AssessmentData } from '../assessment-data'
import { getString, getYesNo, getSelectedLabels, getBool } from '../assessment-data'
import { wrapHtml, escapeHtml } from './index'

export function generateRiskRegister(data: AssessmentData): string {
  const orgName = data.workspaceName
  const sponsor = getString(data, 'lead_sponsor')
  const criticalAssets = getSelectedLabels(data, 'risk_assets')
  const dataTypes = getSelectedLabels(data, 'risk_data_types')
  const pastIncidents = getYesNo(data, 'risk_past_incidents')
  const incidentTypes = getSelectedLabels(data, 'risk_incident_types')
  const knownGaps = getString(data, 'risk_known_gaps', '')

  // Derive risks based on assessment answers
  const risks: { id: string; name: string; likelihood: number; impact: number; score: number; treatment: string }[] = []
  let riskId = 1

  // Check for access control risks
  if (!getBool(data, 'ctrl_access_mfa')) {
    risks.push({ id: `R${riskId++}`, name: 'Unauthorized Access - No MFA', likelihood: 4, impact: 4, score: 16, treatment: 'Mitigate' })
  }
  if (!getBool(data, 'ctrl_access_sso')) {
    risks.push({ id: `R${riskId++}`, name: 'Credential Management - No SSO', likelihood: 3, impact: 3, score: 9, treatment: 'Mitigate' })
  }

  // Check for endpoint risks
  if (!getBool(data, 'ctrl_endpoint_encrypt')) {
    risks.push({ id: `R${riskId++}`, name: 'Data Loss - Unencrypted Devices', likelihood: 3, impact: 4, score: 12, treatment: 'Mitigate' })
  }
  if (!getBool(data, 'ctrl_endpoint_mdm')) {
    risks.push({ id: `R${riskId++}`, name: 'Unmanaged Endpoints', likelihood: 3, impact: 3, score: 9, treatment: 'Mitigate' })
  }

  // Check for backup risks
  if (!getBool(data, 'ctrl_backup_exists')) {
    risks.push({ id: `R${riskId++}`, name: 'Data Loss - No Backups', likelihood: 2, impact: 5, score: 10, treatment: 'Mitigate' })
  }
  if (!getBool(data, 'ctrl_backup_tested')) {
    risks.push({ id: `R${riskId++}`, name: 'Recovery Failure - Untested Backups', likelihood: 3, impact: 4, score: 12, treatment: 'Mitigate' })
  }

  // Check for monitoring risks
  if (!getBool(data, 'ctrl_logging')) {
    risks.push({ id: `R${riskId++}`, name: 'Undetected Breaches - No Logging', likelihood: 4, impact: 4, score: 16, treatment: 'Mitigate' })
  }
  if (!getBool(data, 'ctrl_vuln_scanning')) {
    risks.push({ id: `R${riskId++}`, name: 'Unpatched Vulnerabilities', likelihood: 4, impact: 3, score: 12, treatment: 'Mitigate' })
  }

  // Check for incident response
  if (!getBool(data, 'ops_incident_process')) {
    risks.push({ id: `R${riskId++}`, name: 'Ineffective Incident Response', likelihood: 3, impact: 4, score: 12, treatment: 'Mitigate' })
  }

  // Check for training
  if (!getBool(data, 'ops_training')) {
    risks.push({ id: `R${riskId++}`, name: 'Security Awareness Gap', likelihood: 4, impact: 3, score: 12, treatment: 'Mitigate' })
  }

  // Default risk if none identified
  if (risks.length === 0) {
    risks.push({ id: 'R1', name: 'General Security Risk', likelihood: 2, impact: 2, score: 4, treatment: 'Monitor' })
  }

  const getRiskLevel = (score: number) => {
    if (score >= 17) return 'Critical'
    if (score >= 10) return 'High'
    if (score >= 5) return 'Medium'
    return 'Low'
  }

  const content = `
    <h2>1. Purpose</h2>
    <p>This Risk Register documents identified information security risks for <strong>${escapeHtml(orgName)}</strong> and tracks their treatment status.</p>

    <h2>2. Risk Context</h2>
    <h3>2.1 Critical Assets</h3>
    ${criticalAssets.length > 0 ? `
    <ul>
      ${criticalAssets.map(a => `<li>${escapeHtml(a)}</li>`).join('\n      ')}
    </ul>
    ` : '<p class="placeholder">No critical assets identified.</p>'}

    <h3>2.2 Sensitive Data Types</h3>
    ${dataTypes.length > 0 ? `
    <ul>
      ${dataTypes.map(d => `<li>${escapeHtml(d)}</li>`).join('\n      ')}
    </ul>
    ` : '<p class="placeholder">No data types specified.</p>'}

    <h3>2.3 Historical Incidents</h3>
    <p><strong>Past Incidents:</strong> ${pastIncidents}</p>
    ${incidentTypes.length > 0 ? `
    <p>Incident types experienced:</p>
    <ul>
      ${incidentTypes.map(i => `<li>${escapeHtml(i)}</li>`).join('\n      ')}
    </ul>
    ` : ''}

    ${knownGaps ? `
    <h3>2.4 Known Security Gaps</h3>
    <p>${escapeHtml(knownGaps)}</p>
    ` : ''}

    <h2>3. Risk Register</h2>
    <table>
      <tr>
        <th>ID</th>
        <th>Risk Description</th>
        <th>L</th>
        <th>I</th>
        <th>Score</th>
        <th>Level</th>
        <th>Treatment</th>
      </tr>
      ${risks.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${escapeHtml(r.name)}</td>
        <td>${r.likelihood}</td>
        <td>${r.impact}</td>
        <td>${r.score}</td>
        <td>${getRiskLevel(r.score)}</td>
        <td>${r.treatment}</td>
      </tr>
      `).join('')}
    </table>
    <p><em>L = Likelihood (1-5), I = Impact (1-5), Score = L × I</em></p>

    <h2>4. Risk Summary</h2>
    <table>
      <tr>
        <th>Risk Level</th>
        <th>Count</th>
      </tr>
      <tr>
        <td>Critical (17-25)</td>
        <td>${risks.filter(r => r.score >= 17).length}</td>
      </tr>
      <tr>
        <td>High (10-16)</td>
        <td>${risks.filter(r => r.score >= 10 && r.score < 17).length}</td>
      </tr>
      <tr>
        <td>Medium (5-9)</td>
        <td>${risks.filter(r => r.score >= 5 && r.score < 10).length}</td>
      </tr>
      <tr>
        <td>Low (1-4)</td>
        <td>${risks.filter(r => r.score < 5).length}</td>
      </tr>
    </table>

    <h2>5. Review Schedule</h2>
    <p>This risk register shall be reviewed:</p>
    <ul>
      <li>Quarterly for high/critical risks</li>
      <li>Semi-annually for medium risks</li>
      <li>Annually for low risks</li>
      <li>After any security incident</li>
    </ul>

    <h2>6. Document Control</h2>
    <table>
      <tr>
        <td><strong>Risk Owner:</strong></td>
        <td>${escapeHtml(sponsor)}</td>
      </tr>
      <tr>
        <td><strong>Last Updated:</strong></td>
        <td>${data.generatedDate}</td>
      </tr>
    </table>
  `

  return wrapHtml('Risk Register', content, orgName, data.generatedDate)
}

import type { AssessmentData } from '../assessment-data'
import { getString, getYesNo, getChoiceLabel } from '../assessment-data'
import { wrapHtml, escapeHtml } from './index'

export function generateRolesResponsibilitiesMatrix(data: AssessmentData): string {
  const orgName = data.workspaceName
  const sponsor = getString(data, 'lead_sponsor')
  const hasSecurityRole = getYesNo(data, 'lead_security_role')
  const securityTitle = getChoiceLabel(data, 'lead_security_title', 'Security Lead')

  const content = `
    <h2>1. Purpose</h2>
    <p>This document defines the roles and responsibilities for information security within <strong>${escapeHtml(orgName)}</strong>, ensuring clear accountability for ISMS activities.</p>

    <h2>2. ISMS Organizational Structure</h2>
    <table>
      <tr>
        <th>Role</th>
        <th>Current Assignment</th>
      </tr>
      <tr>
        <td>Executive Sponsor</td>
        <td>${escapeHtml(sponsor)}</td>
      </tr>
      <tr>
        <td>Dedicated Security Role</td>
        <td>${hasSecurityRole}</td>
      </tr>
      <tr>
        <td>Security Lead Title</td>
        <td>${escapeHtml(securityTitle)}</td>
      </tr>
    </table>

    <h2>3. Roles & Responsibilities Matrix</h2>
    <table>
      <tr>
        <th>Activity</th>
        <th>Executive Sponsor</th>
        <th>Security Lead</th>
        <th>IT Team</th>
        <th>All Staff</th>
      </tr>
      <tr>
        <td>Approve Security Policy</td>
        <td><strong>A</strong></td>
        <td>R</td>
        <td>C</td>
        <td>I</td>
      </tr>
      <tr>
        <td>Risk Assessment</td>
        <td>A</td>
        <td><strong>R</strong></td>
        <td>C</td>
        <td>I</td>
      </tr>
      <tr>
        <td>Security Awareness Training</td>
        <td>A</td>
        <td><strong>R</strong></td>
        <td>C</td>
        <td>I</td>
      </tr>
      <tr>
        <td>Access Control Management</td>
        <td>I</td>
        <td>A</td>
        <td><strong>R</strong></td>
        <td>C</td>
      </tr>
      <tr>
        <td>Incident Response</td>
        <td>I</td>
        <td><strong>A</strong></td>
        <td>R</td>
        <td>C</td>
      </tr>
      <tr>
        <td>Vulnerability Management</td>
        <td>I</td>
        <td>A</td>
        <td><strong>R</strong></td>
        <td>I</td>
      </tr>
      <tr>
        <td>Compliance Monitoring</td>
        <td>I</td>
        <td><strong>R</strong></td>
        <td>C</td>
        <td>I</td>
      </tr>
      <tr>
        <td>Report Security Incidents</td>
        <td>I</td>
        <td>A</td>
        <td>R</td>
        <td><strong>R</strong></td>
      </tr>
      <tr>
        <td>Internal Audit</td>
        <td>A</td>
        <td><strong>R</strong></td>
        <td>C</td>
        <td>I</td>
      </tr>
      <tr>
        <td>Management Review</td>
        <td><strong>A/R</strong></td>
        <td>R</td>
        <td>C</td>
        <td>I</td>
      </tr>
    </table>
    <p><em>Legend: R = Responsible, A = Accountable, C = Consulted, I = Informed</em></p>

    <h2>4. Role Definitions</h2>

    <h3>4.1 Executive Sponsor</h3>
    <ul>
      <li>Provides executive oversight and strategic direction for information security</li>
      <li>Approves security policies, budgets, and major security decisions</li>
      <li>Champions security culture at the executive level</li>
      <li>Participates in management reviews</li>
    </ul>

    <h3>4.2 Security Lead (${escapeHtml(securityTitle)})</h3>
    <ul>
      <li>Develops and maintains the ISMS and associated documentation</li>
      <li>Conducts risk assessments and manages the risk register</li>
      <li>Coordinates security awareness and training programs</li>
      <li>Manages security incidents and coordinates response activities</li>
      <li>Reports on ISMS performance to executive management</li>
      <li>Ensures compliance with security policies and standards</li>
    </ul>

    <h3>4.3 IT Team</h3>
    <ul>
      <li>Implements and maintains technical security controls</li>
      <li>Manages access control systems and user provisioning</li>
      <li>Monitors systems for security events and anomalies</li>
      <li>Performs vulnerability scanning and remediation</li>
      <li>Maintains secure configurations and patch management</li>
    </ul>

    <h3>4.4 All Staff</h3>
    <ul>
      <li>Comply with security policies and procedures</li>
      <li>Complete required security awareness training</li>
      <li>Report security incidents and suspicious activities</li>
      <li>Protect information assets in their custody</li>
    </ul>

    <h2>5. Document Control</h2>
    <table>
      <tr>
        <td><strong>Approved By:</strong></td>
        <td>${escapeHtml(sponsor)}</td>
      </tr>
      <tr>
        <td><strong>Effective Date:</strong></td>
        <td>${data.generatedDate}</td>
      </tr>
    </table>
  `

  return wrapHtml('Roles & Responsibilities Matrix', content, orgName, data.generatedDate)
}

import type { AssessmentData } from '../assessment-data'
import { getString, getYesNo, getSelectedLabels } from '../assessment-data'
import { wrapHtml, escapeHtml } from './index'

export function generateInfoSecurityPolicy(data: AssessmentData): string {
  const orgName = data.workspaceName
  const sponsor = getString(data, 'lead_sponsor')
  const hasSecurityRole = getYesNo(data, 'lead_security_role')
  const securityTitle = getString(data, 'lead_security_title', 'Security Lead')
  const hasPolicies = getYesNo(data, 'lead_policies_exist')
  const regulations = getSelectedLabels(data, 'org_regulations')
  const hasTraining = getYesNo(data, 'ops_training')

  const content = `
    <h2>1. Purpose</h2>
    <p>This Information Security Policy establishes the framework for protecting information assets at <strong>${escapeHtml(orgName)}</strong>. It defines the organization's commitment to information security and provides direction for the implementation of security controls aligned with ISO 27001:2022 requirements.</p>

    <h2>2. Scope</h2>
    <p>This policy applies to:</p>
    <ul>
      <li>All employees, contractors, and third parties with access to ${escapeHtml(orgName)}'s information assets</li>
      <li>All information systems, networks, and data processing facilities</li>
      <li>All locations where ${escapeHtml(orgName)} conducts business</li>
    </ul>

    <h2>3. Policy Statement</h2>
    <p>${escapeHtml(orgName)} is committed to:</p>
    <ul>
      <li>Protecting the confidentiality, integrity, and availability of information assets</li>
      <li>Complying with all applicable legal, regulatory, and contractual requirements</li>
      <li>Continuously improving the effectiveness of the Information Security Management System (ISMS)</li>
      <li>Providing appropriate resources for information security initiatives</li>
    </ul>

    <h2>4. Leadership & Governance</h2>
    <table>
      <tr>
        <th>Attribute</th>
        <th>Status</th>
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
      <tr>
        <td>Documented Policies Exist</td>
        <td>${hasPolicies}</td>
      </tr>
    </table>

    <h2>5. Regulatory Compliance</h2>
    ${regulations.length > 0 ? `
    <p>The organization must comply with the following regulations:</p>
    <ul>
      ${regulations.map(r => `<li>${escapeHtml(r)}</li>`).join('\n      ')}
    </ul>
    ` : '<p class="placeholder">No specific regulations identified.</p>'}

    <h2>6. Responsibilities</h2>
    <h3>6.1 Executive Management</h3>
    <ul>
      <li>Approve the Information Security Policy and allocate resources</li>
      <li>Demonstrate leadership commitment to information security</li>
      <li>Review ISMS performance through management reviews</li>
    </ul>

    <h3>6.2 Security Lead</h3>
    <ul>
      <li>Develop and maintain information security policies and procedures</li>
      <li>Coordinate security awareness and training programs</li>
      <li>Monitor and report on security incidents and metrics</li>
    </ul>

    <h3>6.3 All Personnel</h3>
    <ul>
      <li>Comply with information security policies and procedures</li>
      <li>Report security incidents and vulnerabilities</li>
      <li>Complete required security awareness training</li>
    </ul>

    <h2>7. Security Awareness</h2>
    <p><strong>Security Training Provided:</strong> ${hasTraining}</p>
    <p>All personnel must complete security awareness training upon joining and refresher training as required.</p>

    <h2>8. Policy Review</h2>
    <p>This policy shall be reviewed at least annually or when significant changes occur to ensure its continued suitability, adequacy, and effectiveness.</p>

    <h2>9. Approval</h2>
    <table>
      <tr>
        <td><strong>Approved By:</strong></td>
        <td>${escapeHtml(sponsor)}</td>
      </tr>
      <tr>
        <td><strong>Effective Date:</strong></td>
        <td>${data.generatedDate}</td>
      </tr>
      <tr>
        <td><strong>Next Review:</strong></td>
        <td>Within 12 months</td>
      </tr>
    </table>
  `

  return wrapHtml('Information Security Policy', content, orgName, data.generatedDate)
}

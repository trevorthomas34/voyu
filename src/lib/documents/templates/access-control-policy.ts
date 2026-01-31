import type { AssessmentData } from '../assessment-data'
import { getString, getYesNo } from '../assessment-data'
import { wrapHtml, escapeHtml } from './index'

export function generateAccessControlPolicy(data: AssessmentData): string {
  const orgName = data.workspaceName
  const sponsor = getString(data, 'lead_sponsor')
  const hasSSO = getYesNo(data, 'ctrl_access_sso')
  const hasMFA = getYesNo(data, 'ctrl_access_mfa')
  const hasReviews = getYesNo(data, 'ctrl_access_review')

  const content = `
    <h2>1. Purpose</h2>
    <p>This policy establishes access control requirements for <strong>${escapeHtml(orgName)}</strong> to ensure that access to information and systems is appropriately managed and protected.</p>

    <h2>2. Scope</h2>
    <p>This policy applies to:</p>
    <ul>
      <li>All employees, contractors, and third parties requiring access</li>
      <li>All information systems, applications, and data</li>
      <li>Physical access to secure areas</li>
    </ul>

    <h2>3. Current Implementation Status</h2>
    <table>
      <tr>
        <th>Control</th>
        <th>Status</th>
      </tr>
      <tr>
        <td>Single Sign-On (SSO)</td>
        <td>${hasSSO}</td>
      </tr>
      <tr>
        <td>Multi-Factor Authentication (MFA)</td>
        <td>${hasMFA}</td>
      </tr>
      <tr>
        <td>Regular Access Reviews</td>
        <td>${hasReviews}</td>
      </tr>
    </table>

    <h2>4. Access Control Principles</h2>
    <h3>4.1 Least Privilege</h3>
    <p>Users shall be granted only the minimum access rights necessary to perform their job functions.</p>

    <h3>4.2 Need to Know</h3>
    <p>Access to sensitive information shall be restricted to individuals who require it for legitimate business purposes.</p>

    <h3>4.3 Segregation of Duties</h3>
    <p>Critical functions shall be separated to prevent fraud and errors. No single individual should control all aspects of a critical process.</p>

    <h2>5. User Access Management</h2>
    <h3>5.1 User Registration</h3>
    <ul>
      <li>Access requests must be approved by the user's manager</li>
      <li>Users must be assigned a unique identifier</li>
      <li>Access rights must be documented</li>
    </ul>

    <h3>5.2 Access Provisioning</h3>
    <ul>
      <li>Access shall be provisioned based on role requirements</li>
      <li>Temporary or contractor access must have an expiration date</li>
      <li>Privileged access requires additional approval</li>
    </ul>

    <h3>5.3 Access Review</h3>
    <ul>
      <li>User access rights shall be reviewed at least quarterly</li>
      <li>Privileged access shall be reviewed monthly</li>
      <li>Access for terminated users shall be revoked immediately</li>
    </ul>

    <h3>5.4 Access Revocation</h3>
    <ul>
      <li>Access shall be revoked upon termination or role change</li>
      <li>HR must notify IT of all terminations within 24 hours</li>
      <li>Shared credentials must be changed when users depart</li>
    </ul>

    <h2>6. Authentication Requirements</h2>
    <h3>6.1 Password Policy</h3>
    <ul>
      <li>Minimum length: 12 characters</li>
      <li>Complexity: Mix of uppercase, lowercase, numbers, symbols</li>
      <li>Password reuse: Last 12 passwords prohibited</li>
      <li>Maximum age: 90 days (or per risk assessment)</li>
    </ul>

    <h3>6.2 Multi-Factor Authentication</h3>
    <p>MFA is required for:</p>
    <ul>
      <li>All remote access</li>
      <li>Privileged/administrative accounts</li>
      <li>Access to sensitive systems and data</li>
      <li>Cloud service access</li>
    </ul>

    <h2>7. Privileged Access</h2>
    <ul>
      <li>Administrative accounts must be separate from standard user accounts</li>
      <li>Privileged actions must be logged and monitored</li>
      <li>Privileged access must be time-limited where possible</li>
      <li>Regular review of privileged access is required</li>
    </ul>

    <h2>8. Remote Access</h2>
    <ul>
      <li>VPN or secure connection required for remote access</li>
      <li>MFA required for all remote access</li>
      <li>Split tunneling prohibited unless approved</li>
    </ul>

    <h2>9. Third-Party Access</h2>
    <ul>
      <li>Third-party access requires formal agreement</li>
      <li>Access must be limited to specific systems and timeframes</li>
      <li>Third-party access must be monitored and logged</li>
    </ul>

    <h2>10. Compliance & Enforcement</h2>
    <p>Violations of this policy may result in disciplinary action up to and including termination of employment or contract.</p>

    <h2>11. Document Control</h2>
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
        <td><strong>Review Date:</strong></td>
        <td>Within 12 months</td>
      </tr>
    </table>
  `

  return wrapHtml('Access Control Policy', content, orgName, data.generatedDate)
}

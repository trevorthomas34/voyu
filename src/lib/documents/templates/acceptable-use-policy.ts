import type { AssessmentData } from '../assessment-data'
import { getString, getYesNo } from '../assessment-data'
import { wrapHtml, escapeHtml } from './index'

export function generateAcceptableUsePolicy(data: AssessmentData): string {
  const orgName = data.workspaceName
  const sponsor = getString(data, 'lead_sponsor')
  const hasTraining = getYesNo(data, 'ops_training')

  const content = `
    <h2>1. Purpose</h2>
    <p>This Acceptable Use Policy outlines the acceptable use of information technology resources at <strong>${escapeHtml(orgName)}</strong>. These rules protect the organization and its employees from security risks.</p>

    <h2>2. Scope</h2>
    <p>This policy applies to all employees, contractors, consultants, and other workers who have access to ${escapeHtml(orgName)}'s systems, including:</p>
    <ul>
      <li>Company-owned devices (laptops, desktops, mobile devices)</li>
      <li>Personal devices used for work (BYOD)</li>
      <li>Company networks and internet access</li>
      <li>Email and collaboration tools</li>
      <li>Cloud services and applications</li>
    </ul>

    <h2>3. General Use</h2>
    <h3>3.1 Acceptable Use</h3>
    <ul>
      <li>Use resources primarily for authorized business purposes</li>
      <li>Protect login credentials and never share passwords</li>
      <li>Lock screens when leaving devices unattended</li>
      <li>Report suspected security incidents immediately</li>
      <li>Follow data classification and handling guidelines</li>
    </ul>

    <h3>3.2 Prohibited Activities</h3>
    <ul>
      <li>Accessing or distributing illegal content</li>
      <li>Unauthorized access to systems or data</li>
      <li>Installing unauthorized software</li>
      <li>Circumventing security controls</li>
      <li>Sharing confidential information without authorization</li>
      <li>Using company resources for personal financial gain</li>
      <li>Harassment, discrimination, or offensive communications</li>
    </ul>

    <h2>4. Email & Communications</h2>
    <ul>
      <li>Use company email for business communications</li>
      <li>Do not open suspicious attachments or links</li>
      <li>Verify sender identity before sharing sensitive information</li>
      <li>Use encryption for confidential communications</li>
      <li>Avoid forwarding chain emails or spam</li>
    </ul>

    <h2>5. Internet Use</h2>
    <ul>
      <li>Internet access is provided for business purposes</li>
      <li>Limited personal use is permitted if it does not interfere with work</li>
      <li>Streaming and downloads should not impact network performance</li>
      <li>Do not access inappropriate or illegal websites</li>
      <li>Use caution with public Wi-Fi; use VPN when available</li>
    </ul>

    <h2>6. Device Security</h2>
    <h3>6.1 Company Devices</h3>
    <ul>
      <li>Keep devices physically secure</li>
      <li>Enable device encryption</li>
      <li>Install security updates promptly</li>
      <li>Use only approved software</li>
      <li>Report lost or stolen devices immediately</li>
    </ul>

    <h3>6.2 Personal Devices (BYOD)</h3>
    <ul>
      <li>Must comply with security requirements (encryption, passcode)</li>
      <li>Company reserves right to wipe company data remotely</li>
      <li>Keep personal and work data separate</li>
      <li>Install required security software</li>
    </ul>

    <h2>7. Data Handling</h2>
    <ul>
      <li>Handle data according to its classification level</li>
      <li>Do not store sensitive data on unauthorized devices or services</li>
      <li>Use approved file sharing methods only</li>
      <li>Dispose of sensitive documents securely</li>
    </ul>

    <h2>8. Social Media</h2>
    <ul>
      <li>Do not share confidential company information</li>
      <li>Be professional when representing the company</li>
      <li>Do not post content that could harm the company's reputation</li>
      <li>Report suspicious contact or social engineering attempts</li>
    </ul>

    <h2>9. Security Awareness</h2>
    <p><strong>Security Training Required:</strong> ${hasTraining}</p>
    <ul>
      <li>Complete required security awareness training</li>
      <li>Stay informed about current security threats</li>
      <li>Report phishing attempts and suspicious activity</li>
    </ul>

    <h2>10. Monitoring</h2>
    <p>${escapeHtml(orgName)} reserves the right to monitor use of company systems and networks to ensure compliance with this policy and to protect company assets. This may include:</p>
    <ul>
      <li>Network traffic monitoring</li>
      <li>Email scanning for security threats</li>
      <li>Endpoint security monitoring</li>
      <li>Access logging</li>
    </ul>

    <h2>11. Enforcement</h2>
    <p>Violations of this policy may result in:</p>
    <ul>
      <li>Revocation of access privileges</li>
      <li>Disciplinary action up to termination</li>
      <li>Legal action if laws are violated</li>
    </ul>

    <h2>12. Acknowledgment</h2>
    <p>All users must acknowledge they have read and understood this policy.</p>

    <h2>13. Document Control</h2>
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

  return wrapHtml('Acceptable Use Policy', content, orgName, data.generatedDate)
}

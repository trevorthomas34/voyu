import type { AssessmentData } from '../assessment-data'
import { getString, getYesNo, getSelectedLabels } from '../assessment-data'
import { wrapHtml, escapeHtml } from './index'

export function generateIncidentResponseProcedure(data: AssessmentData): string {
  const orgName = data.workspaceName
  const sponsor = getString(data, 'lead_sponsor')
  const securityTitle = getString(data, 'lead_security_title', 'Security Lead')
  const hasProcess = getYesNo(data, 'ops_incident_process')
  const hasDocumented = getYesNo(data, 'ops_incident_documented')
  const hasLogging = getYesNo(data, 'ctrl_logging')
  const pastIncidents = getYesNo(data, 'risk_past_incidents')
  const incidentTypes = getSelectedLabels(data, 'risk_incident_types')

  const content = `
    <h2>1. Purpose</h2>
    <p>This procedure establishes the framework for detecting, responding to, and recovering from information security incidents at <strong>${escapeHtml(orgName)}</strong>.</p>

    <h2>2. Current Status</h2>
    <table>
      <tr>
        <th>Capability</th>
        <th>Status</th>
      </tr>
      <tr>
        <td>Incident Response Process</td>
        <td>${hasProcess}</td>
      </tr>
      <tr>
        <td>Documented Procedures</td>
        <td>${hasDocumented}</td>
      </tr>
      <tr>
        <td>Centralized Logging</td>
        <td>${hasLogging}</td>
      </tr>
      <tr>
        <td>Past Incidents Experienced</td>
        <td>${pastIncidents}</td>
      </tr>
    </table>

    ${incidentTypes.length > 0 ? `
    <h3>2.1 Historical Incident Types</h3>
    <ul>
      ${incidentTypes.map(i => `<li>${escapeHtml(i)}</li>`).join('\n      ')}
    </ul>
    ` : ''}

    <h2>3. Incident Response Team</h2>
    <table>
      <tr>
        <th>Role</th>
        <th>Responsibilities</th>
      </tr>
      <tr>
        <td>Incident Commander</td>
        <td>Overall incident coordination and decision-making</td>
      </tr>
      <tr>
        <td>${escapeHtml(securityTitle)}</td>
        <td>Technical investigation and containment</td>
      </tr>
      <tr>
        <td>IT Team</td>
        <td>System recovery and technical support</td>
      </tr>
      <tr>
        <td>Communications</td>
        <td>Internal and external communications</td>
      </tr>
      <tr>
        <td>Legal/Compliance</td>
        <td>Regulatory notification and legal matters</td>
      </tr>
    </table>

    <h2>4. Incident Classification</h2>
    <table>
      <tr>
        <th>Severity</th>
        <th>Description</th>
        <th>Response Time</th>
      </tr>
      <tr>
        <td>Critical</td>
        <td>Major data breach, system-wide outage, active attack</td>
        <td>Immediate</td>
      </tr>
      <tr>
        <td>High</td>
        <td>Confirmed security breach, significant data exposure</td>
        <td>Within 1 hour</td>
      </tr>
      <tr>
        <td>Medium</td>
        <td>Suspicious activity, potential vulnerability exploitation</td>
        <td>Within 4 hours</td>
      </tr>
      <tr>
        <td>Low</td>
        <td>Policy violation, minor security event</td>
        <td>Within 24 hours</td>
      </tr>
    </table>

    <h2>5. Incident Response Phases</h2>

    <h3>5.1 Preparation</h3>
    <ul>
      <li>Maintain incident response team contact information</li>
      <li>Ensure logging and monitoring capabilities</li>
      <li>Conduct regular incident response training</li>
      <li>Test incident response procedures annually</li>
    </ul>

    <h3>5.2 Detection & Analysis</h3>
    <ul>
      <li>Monitor security alerts and logs</li>
      <li>Validate potential incidents</li>
      <li>Determine scope and impact</li>
      <li>Classify incident severity</li>
      <li>Document initial findings</li>
    </ul>

    <h3>5.3 Containment</h3>
    <ul>
      <li>Isolate affected systems</li>
      <li>Preserve evidence for investigation</li>
      <li>Prevent further damage</li>
      <li>Implement temporary workarounds</li>
    </ul>

    <h3>5.4 Eradication</h3>
    <ul>
      <li>Identify root cause</li>
      <li>Remove malware or threats</li>
      <li>Patch vulnerabilities</li>
      <li>Reset compromised credentials</li>
    </ul>

    <h3>5.5 Recovery</h3>
    <ul>
      <li>Restore systems from clean backups</li>
      <li>Verify system integrity</li>
      <li>Monitor for recurring issues</li>
      <li>Return to normal operations</li>
    </ul>

    <h3>5.6 Post-Incident</h3>
    <ul>
      <li>Conduct lessons learned review</li>
      <li>Update procedures and controls</li>
      <li>Complete incident report</li>
      <li>Communicate to stakeholders</li>
    </ul>

    <h2>6. Reporting Requirements</h2>
    <h3>6.1 Internal Reporting</h3>
    <ul>
      <li>All suspected incidents must be reported to ${escapeHtml(securityTitle)}</li>
      <li>Critical/High incidents escalate to executive management</li>
      <li>Incident status updates every 4 hours during active response</li>
    </ul>

    <h3>6.2 External Reporting</h3>
    <ul>
      <li>Regulatory notifications per applicable requirements (GDPR, etc.)</li>
      <li>Customer notification if their data is affected</li>
      <li>Law enforcement notification for criminal activity</li>
    </ul>

    <h2>7. Contact Information</h2>
    <table>
      <tr>
        <th>Contact</th>
        <th>Details</th>
      </tr>
      <tr>
        <td>Security Team</td>
        <td>[security@${orgName.toLowerCase().replace(/\s+/g, '')}.com]</td>
      </tr>
      <tr>
        <td>Executive Sponsor</td>
        <td>${escapeHtml(sponsor)}</td>
      </tr>
      <tr>
        <td>Legal Counsel</td>
        <td>[To be completed]</td>
      </tr>
    </table>

    <h2>8. Document Control</h2>
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

  return wrapHtml('Incident Response Procedure', content, orgName, data.generatedDate)
}

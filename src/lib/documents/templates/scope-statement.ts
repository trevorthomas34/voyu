import type { AssessmentData } from '../assessment-data'
import { getString, getSelectedLabels, getChoiceLabel } from '../assessment-data'
import { wrapHtml, escapeHtml } from './index'

export function generateScopeStatement(data: AssessmentData): string {
  const orgName = data.workspaceName
  const industry = getChoiceLabel(data, 'org_industry', 'Not specified')
  const size = getChoiceLabel(data, 'org_size', 'Not specified')
  const locations = getSelectedLabels(data, 'org_locations')
  const dataTypes = getSelectedLabels(data, 'risk_data_types')
  const dataLocations = getSelectedLabels(data, 'risk_data_locations')
  const cloudProviders = getSelectedLabels(data, 'ctrl_cloud_provider')

  const content = `
    <h2>1. Introduction</h2>
    <p>This document defines the scope of the Information Security Management System (ISMS) for <strong>${escapeHtml(orgName)}</strong>, in accordance with ISO 27001:2022 Clause 4.3.</p>

    <h2>2. Organization Context</h2>
    <table>
      <tr>
        <th>Attribute</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Organization Name</td>
        <td>${escapeHtml(orgName)}</td>
      </tr>
      <tr>
        <td>Industry</td>
        <td>${escapeHtml(industry)}</td>
      </tr>
      <tr>
        <td>Organization Size</td>
        <td>${escapeHtml(size)}</td>
      </tr>
    </table>

    <h2>3. Geographic Scope</h2>
    <p>The ISMS applies to operations in the following locations:</p>
    ${locations.length > 0 ? `
    <ul>
      ${locations.map(l => `<li>${escapeHtml(l)}</li>`).join('\n      ')}
    </ul>
    ` : '<p class="placeholder">No locations specified.</p>'}

    <h2>4. Information Assets in Scope</h2>
    <h3>4.1 Data Types</h3>
    ${dataTypes.length > 0 ? `
    <ul>
      ${dataTypes.map(d => `<li>${escapeHtml(d)}</li>`).join('\n      ')}
    </ul>
    ` : '<p class="placeholder">No data types specified.</p>'}

    <h3>4.2 Data Storage Locations</h3>
    ${dataLocations.length > 0 ? `
    <ul>
      ${dataLocations.map(l => `<li>${escapeHtml(l)}</li>`).join('\n      ')}
    </ul>
    ` : '<p class="placeholder">No storage locations specified.</p>'}

    <h2>5. Technology Scope</h2>
    <h3>5.1 Cloud Infrastructure</h3>
    ${cloudProviders.length > 0 ? `
    <ul>
      ${cloudProviders.map(c => `<li>${escapeHtml(c)}</li>`).join('\n      ')}
    </ul>
    ` : '<p class="placeholder">No cloud providers specified.</p>'}

    <h3>5.2 Systems in Scope</h3>
    <ul>
      <li>All production systems and environments</li>
      <li>Development and testing environments with access to production data</li>
      <li>Corporate IT infrastructure (email, collaboration tools, identity management)</li>
      <li>Employee endpoints (laptops, mobile devices)</li>
      <li>Network infrastructure (firewalls, VPNs, switches)</li>
    </ul>

    <h2>6. Organizational Units in Scope</h2>
    <p>The ISMS applies to all departments and functions within ${escapeHtml(orgName)}, including:</p>
    <ul>
      <li>Executive Management</li>
      <li>Information Technology</li>
      <li>Human Resources</li>
      <li>Operations</li>
      <li>All other business units</li>
    </ul>

    <h2>7. Exclusions</h2>
    <p>The following are explicitly excluded from the ISMS scope:</p>
    <ul>
      <li>Personal devices not used for business purposes</li>
      <li>Third-party systems not processing ${escapeHtml(orgName)} data</li>
      <li>Publicly available information</li>
    </ul>

    <h2>8. Interfaces and Dependencies</h2>
    <p>The ISMS considers interfaces with:</p>
    <ul>
      <li>Third-party service providers and vendors</li>
      <li>Customers and partners</li>
      <li>Regulatory bodies</li>
    </ul>

    <h2>9. Scope Approval</h2>
    <table>
      <tr>
        <td><strong>Approved By:</strong></td>
        <td>${getString(data, 'lead_sponsor')}</td>
      </tr>
      <tr>
        <td><strong>Effective Date:</strong></td>
        <td>${data.generatedDate}</td>
      </tr>
    </table>
  `

  return wrapHtml('ISMS Scope Statement', content, orgName, data.generatedDate)
}

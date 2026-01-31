import type { AssessmentData } from '../assessment-data'
import { getString, getYesNo, getSelectedLabels } from '../assessment-data'
import { wrapHtml, escapeHtml } from './index'

export function generateBusinessContinuityOverview(data: AssessmentData): string {
  const orgName = data.workspaceName
  const sponsor = getString(data, 'lead_sponsor')
  const hasBackups = getYesNo(data, 'ctrl_backup_exists')
  const backupsTested = getYesNo(data, 'ctrl_backup_tested')
  const criticalAssets = getSelectedLabels(data, 'risk_assets')
  const dataLocations = getSelectedLabels(data, 'risk_data_locations')
  const cloudProviders = getSelectedLabels(data, 'ctrl_cloud_provider')

  const content = `
    <h2>1. Purpose</h2>
    <p>This document provides an overview of business continuity planning for <strong>${escapeHtml(orgName)}</strong>, ensuring the organization can maintain critical operations during and after a disruption.</p>

    <h2>2. Current Capabilities</h2>
    <table>
      <tr>
        <th>Capability</th>
        <th>Status</th>
      </tr>
      <tr>
        <td>Regular Backup Procedures</td>
        <td>${hasBackups}</td>
      </tr>
      <tr>
        <td>Backup Testing</td>
        <td>${backupsTested}</td>
      </tr>
    </table>

    <h2>3. Critical Assets</h2>
    ${criticalAssets.length > 0 ? `
    <ul>
      ${criticalAssets.map(a => `<li>${escapeHtml(a)}</li>`).join('\n      ')}
    </ul>
    ` : '<p class="placeholder">No critical assets identified.</p>'}

    <h2>4. Data Storage Locations</h2>
    ${dataLocations.length > 0 ? `
    <ul>
      ${dataLocations.map(l => `<li>${escapeHtml(l)}</li>`).join('\n      ')}
    </ul>
    ` : '<p class="placeholder">No storage locations specified.</p>'}

    <h2>5. Cloud Infrastructure</h2>
    ${cloudProviders.length > 0 ? `
    <ul>
      ${cloudProviders.map(c => `<li>${escapeHtml(c)}</li>`).join('\n      ')}
    </ul>
    ` : '<p class="placeholder">No cloud providers specified.</p>'}

    <h2>6. Recovery Objectives</h2>
    <table>
      <tr>
        <th>System Category</th>
        <th>RTO Target</th>
        <th>RPO Target</th>
      </tr>
      <tr>
        <td>Critical Business Systems</td>
        <td>4 hours</td>
        <td>1 hour</td>
      </tr>
      <tr>
        <td>Core Infrastructure</td>
        <td>8 hours</td>
        <td>4 hours</td>
      </tr>
      <tr>
        <td>Supporting Systems</td>
        <td>24 hours</td>
        <td>24 hours</td>
      </tr>
      <tr>
        <td>Non-Critical Systems</td>
        <td>72 hours</td>
        <td>48 hours</td>
      </tr>
    </table>
    <p><em>RTO = Recovery Time Objective, RPO = Recovery Point Objective</em></p>

    <h2>7. Business Impact Categories</h2>
    <table>
      <tr>
        <th>Category</th>
        <th>Description</th>
        <th>Priority</th>
      </tr>
      <tr>
        <td>Critical</td>
        <td>Operations cannot function without these systems</td>
        <td>1</td>
      </tr>
      <tr>
        <td>Essential</td>
        <td>Significant impact but temporary workarounds exist</td>
        <td>2</td>
      </tr>
      <tr>
        <td>Important</td>
        <td>Reduced efficiency but operations continue</td>
        <td>3</td>
      </tr>
      <tr>
        <td>Non-Critical</td>
        <td>Minimal immediate impact</td>
        <td>4</td>
      </tr>
    </table>

    <h2>8. Recovery Strategies</h2>
    <h3>8.1 Data Recovery</h3>
    <ul>
      <li>Automated backups of critical data</li>
      <li>Off-site/cloud backup storage</li>
      <li>Regular backup verification and testing</li>
      <li>Documented restoration procedures</li>
    </ul>

    <h3>8.2 System Recovery</h3>
    <ul>
      <li>Infrastructure-as-code for rapid rebuilding</li>
      <li>Documented system configurations</li>
      <li>Disaster recovery site or cloud failover</li>
      <li>Vendor support agreements</li>
    </ul>

    <h3>8.3 Personnel</h3>
    <ul>
      <li>Remote work capabilities</li>
      <li>Cross-training for critical roles</li>
      <li>Emergency contact procedures</li>
    </ul>

    <h2>9. Disruption Scenarios</h2>
    <table>
      <tr>
        <th>Scenario</th>
        <th>Impact</th>
        <th>Response</th>
      </tr>
      <tr>
        <td>Cloud Provider Outage</td>
        <td>System availability</td>
        <td>Failover to backup region/provider</td>
      </tr>
      <tr>
        <td>Ransomware Attack</td>
        <td>Data and systems</td>
        <td>Isolate, restore from backups</td>
      </tr>
      <tr>
        <td>Office Inaccessible</td>
        <td>Personnel</td>
        <td>Enable remote work</td>
      </tr>
      <tr>
        <td>Key Personnel Unavailable</td>
        <td>Operations</td>
        <td>Activate backup personnel</td>
      </tr>
    </table>

    <h2>10. Testing Schedule</h2>
    <table>
      <tr>
        <th>Test Type</th>
        <th>Frequency</th>
      </tr>
      <tr>
        <td>Backup Restoration</td>
        <td>Quarterly</td>
      </tr>
      <tr>
        <td>Failover Testing</td>
        <td>Semi-annually</td>
      </tr>
      <tr>
        <td>Tabletop Exercise</td>
        <td>Annually</td>
      </tr>
      <tr>
        <td>Full BC Test</td>
        <td>Annually</td>
      </tr>
    </table>

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
    </table>
  `

  return wrapHtml('Business Continuity Overview', content, orgName, data.generatedDate)
}

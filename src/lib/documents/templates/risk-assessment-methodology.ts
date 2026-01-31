import type { AssessmentData } from '../assessment-data'
import { getString, getYesNo } from '../assessment-data'
import { wrapHtml, escapeHtml } from './index'

export function generateRiskAssessmentMethodology(data: AssessmentData): string {
  const orgName = data.workspaceName
  const sponsor = getString(data, 'lead_sponsor')
  const hasRiskAssessment = getYesNo(data, 'risk_assessment_done')

  const content = `
    <h2>1. Purpose</h2>
    <p>This document defines the risk assessment methodology used by <strong>${escapeHtml(orgName)}</strong> to identify, analyze, and evaluate information security risks in accordance with ISO 27001:2022.</p>

    <h2>2. Current Status</h2>
    <table>
      <tr>
        <th>Attribute</th>
        <th>Status</th>
      </tr>
      <tr>
        <td>Formal Risk Assessment Performed</td>
        <td>${hasRiskAssessment}</td>
      </tr>
    </table>

    <h2>3. Risk Assessment Process</h2>
    <h3>3.1 Overview</h3>
    <p>The risk assessment process consists of the following phases:</p>
    <ol>
      <li><strong>Context Establishment</strong> - Define scope and criteria</li>
      <li><strong>Risk Identification</strong> - Identify assets, threats, and vulnerabilities</li>
      <li><strong>Risk Analysis</strong> - Determine likelihood and impact</li>
      <li><strong>Risk Evaluation</strong> - Compare against risk criteria</li>
      <li><strong>Risk Treatment</strong> - Select and implement controls</li>
    </ol>

    <h2>4. Risk Identification</h2>
    <h3>4.1 Asset Identification</h3>
    <p>Information assets are identified and categorized by:</p>
    <ul>
      <li>Data and information (customer data, employee data, intellectual property)</li>
      <li>Software (applications, operating systems, utilities)</li>
      <li>Hardware (servers, workstations, mobile devices)</li>
      <li>Services (cloud services, network services)</li>
      <li>People (employees, contractors)</li>
    </ul>

    <h3>4.2 Threat Identification</h3>
    <p>Threats are identified from sources including:</p>
    <ul>
      <li>Historical incident data</li>
      <li>Industry threat intelligence</li>
      <li>Vulnerability assessments</li>
      <li>Regulatory requirements</li>
    </ul>

    <h2>5. Risk Analysis</h2>
    <h3>5.1 Likelihood Scale</h3>
    <table>
      <tr>
        <th>Level</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
      <tr>
        <td>Rare</td>
        <td>1</td>
        <td>May occur only in exceptional circumstances</td>
      </tr>
      <tr>
        <td>Unlikely</td>
        <td>2</td>
        <td>Could occur but not expected</td>
      </tr>
      <tr>
        <td>Possible</td>
        <td>3</td>
        <td>Might occur at some time</td>
      </tr>
      <tr>
        <td>Likely</td>
        <td>4</td>
        <td>Will probably occur</td>
      </tr>
      <tr>
        <td>Almost Certain</td>
        <td>5</td>
        <td>Expected to occur in most circumstances</td>
      </tr>
    </table>

    <h3>5.2 Impact Scale</h3>
    <table>
      <tr>
        <th>Level</th>
        <th>Value</th>
        <th>Description</th>
      </tr>
      <tr>
        <td>Insignificant</td>
        <td>1</td>
        <td>No significant impact on operations</td>
      </tr>
      <tr>
        <td>Minor</td>
        <td>2</td>
        <td>Minor operational disruption</td>
      </tr>
      <tr>
        <td>Moderate</td>
        <td>3</td>
        <td>Significant but recoverable impact</td>
      </tr>
      <tr>
        <td>Major</td>
        <td>4</td>
        <td>Major impact requiring significant resources</td>
      </tr>
      <tr>
        <td>Critical</td>
        <td>5</td>
        <td>Catastrophic impact threatening business viability</td>
      </tr>
    </table>

    <h3>5.3 Risk Rating Matrix</h3>
    <p>Risk Level = Likelihood × Impact</p>
    <table>
      <tr>
        <th>Risk Score</th>
        <th>Level</th>
        <th>Action Required</th>
      </tr>
      <tr>
        <td>1-4</td>
        <td>Low</td>
        <td>Accept or monitor</td>
      </tr>
      <tr>
        <td>5-9</td>
        <td>Medium</td>
        <td>Treat within 6 months</td>
      </tr>
      <tr>
        <td>10-16</td>
        <td>High</td>
        <td>Treat within 3 months</td>
      </tr>
      <tr>
        <td>17-25</td>
        <td>Critical</td>
        <td>Immediate action required</td>
      </tr>
    </table>

    <h2>6. Risk Treatment Options</h2>
    <ul>
      <li><strong>Mitigate</strong> - Implement controls to reduce likelihood or impact</li>
      <li><strong>Transfer</strong> - Share risk through insurance or outsourcing</li>
      <li><strong>Avoid</strong> - Eliminate the risk by removing the activity</li>
      <li><strong>Accept</strong> - Accept the risk when within tolerance</li>
    </ul>

    <h2>7. Review Frequency</h2>
    <p>Risk assessments shall be conducted:</p>
    <ul>
      <li>At least annually</li>
      <li>When significant changes occur to systems or processes</li>
      <li>After security incidents</li>
      <li>When new threats or vulnerabilities are identified</li>
    </ul>

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

  return wrapHtml('Risk Assessment Methodology', content, orgName, data.generatedDate)
}

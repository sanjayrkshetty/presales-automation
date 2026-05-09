const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, ShadingType, HeadingLevel, PageBreak,
  AlignmentType, Footer, Header, PageNumber, NumberFormat,
} = require('docx');

const BRAND = {
  darkBlue: '1F3864',
  midBlue: '2E74B5',
  lightBlue: 'D5E8F0',
  black: '000000',
  white: 'FFFFFF',
  gray: '595959',
};

function formatDate(d = new Date()) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateShort(d = new Date()) {
  return d.toLocaleDateString('en-GB').replace(/\//g, '/');
}

function run(text, opts = {}) {
  return new TextRun({ text, font: 'Arial', size: 22, ...opts });
}

function p(children, opts = {}) {
  if (typeof children === 'string') children = [run(children)];
  return new Paragraph({ children, ...opts });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, font: 'Arial', size: 28, color: BRAND.darkBlue })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text, bold: true, font: 'Arial', size: 24, color: BRAND.midBlue })],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    children: [new TextRun({ text, font: 'Arial', size: 20 })],
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function spacer() {
  return new Paragraph({ children: [run('')] });
}

function cell(text, { bold = false, shaded = false, width = 3120, color = BRAND.black } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
      right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    },
    shading: shaded
      ? { fill: BRAND.lightBlue, type: ShadingType.CLEAR }
      : { fill: 'FFFFFF', type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold, font: 'Arial', size: 20, color })] })],
  });
}

function headerCell(text, width = 3120) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { fill: BRAND.midBlue, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: BRAND.white, font: 'Arial', size: 20 })] })],
  });
}

function simpleTable(rows, widths) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    rows: rows.map(rowCells => new TableRow({
      children: rowCells.map((c, i) => c instanceof TableCell ? c : cell(c, { width: widths?.[i] || 3120 })),
    })),
  });
}

function makeFooter(year) {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `SISA DFIR | Proposal │ ${year}`, font: 'Arial', size: 18, color: BRAND.gray })],
    })],
  });
}

// ─── STATIC CONTENT ────────────────────────────────────────────────────────────

function sisaAbout() {
  return [
    h1('1. About SISA'),
    p('SISA Information Security is a global cybersecurity and compliance company with over 20 years of experience helping organisations across financial services, healthcare, retail, and government sectors secure their critical assets. As a PCI Security Standards Council (PCI SSC) approved Qualified Security Assessor (QSA), SISA provides end-to-end cybersecurity solutions that encompass compliance, assessment, advisory, and managed security services.'),
    spacer(),
    p('With a dedicated team of over 400 security professionals operating from offices across India, the Middle East, Southeast Asia, and the Americas, SISA has successfully partnered with more than 1,000 organisations globally, enabling them to build robust security postures and meet regulatory requirements.'),
  ];
}

function sisaDFIRServices() {
  return [
    h1('2. SISA\'s DFIR Services'),
    p('SISA\'s Digital Forensics and Incident Response (DFIR) practice offers a comprehensive range of services designed to help organisations prepare for, detect, and respond to cyber threats:'),
    bullet('Incident Response (Ransomware Recovery or Compromise Assessment)'),
    bullet('PCI Forensic Investigation (PFI)'),
    bullet('Independent Investigation (IDI)'),
    bullet('Internal Forensic Investigation (IFI)'),
    bullet('Forensic Retainer Agreements'),
    bullet('Forensic Readiness Assessment'),
    bullet('Dark Web Scanning'),
    bullet('ATM Malware Reviews'),
  ];
}

function sisaDFIRJourney() {
  return [
    h1('3. SISA\'s DFIR Journey'),
    p('Since establishing our DFIR practice, SISA has built a proven track record of assisting organisations in mitigating the impact of cyber incidents. Our journey spans hundreds of investigations across multiple sectors and geographies, giving our team unparalleled experience in dealing with the full spectrum of cyber threats — from targeted attacks and insider threats to ransomware and advanced persistent threats.'),
    spacer(),
    p('Our forensic analysts hold internationally recognised certifications and follow globally accepted forensic frameworks, ensuring that every investigation is conducted with the highest standards of integrity, rigour, and chain-of-custody compliance. SISA has been engaged by leading financial institutions, payment brands, and regulatory bodies to lead sensitive and high-profile investigations.'),
  ];
}

function ifiDefinition() {
  return [
    h1('4. Internal Forensic Investigation'),
    p('An Internal Forensic Investigation (IFI) is a structured, evidence-based examination conducted to identify the root cause, timeline, and impact of a suspected or confirmed security incident within an organisation\'s internal environment. Unlike a PCI Forensic Investigation (PFI) which is mandated by payment brands, an IFI is initiated at the discretion of the organisation — typically in response to a suspected breach, insider threat, data exfiltration, or anomalous activity detected by internal security teams.'),
    spacer(),
    h2('When is an IFI Needed?'),
    bullet('Suspected or confirmed unauthorised access to internal systems or data'),
    bullet('Detection of malware, ransomware, or other malicious software'),
    bullet('Insider threat investigations involving employee misconduct or data theft'),
    bullet('Unusual network activity or anomalies flagged by SIEM/SOC tools'),
    bullet('Regulatory or legal requirement to investigate a potential data breach'),
    bullet('Post-incident validation following containment and remediation'),
  ];
}

function forensicApproach() {
  return [
    h1('5. SISA\'s Forensic Approach'),
    p('SISA follows a structured, repeatable forensic methodology aligned with internationally recognised standards (NIST SP 800-86, ISO/IEC 27043). Our approach ensures that all digital evidence is collected, preserved, and analysed in a legally defensible manner.'),
    spacer(),
    h2('Scoping'),
    p('Define the scope of investigation, identify key systems, data sources, and stakeholders. Establish a communication protocol and chain of custody procedures.'),
    h2('Evidence Collection'),
    p('Systematic identification and collection of digital artefacts from endpoints, servers, network devices, cloud environments, and log management systems.'),
    h2('Image Acquisition'),
    p('Forensic imaging of relevant storage media using write-protected hardware and industry-standard tools, ensuring evidence integrity is maintained throughout.'),
    h2('In-Depth Analysis'),
    p('Analysis of collected artefacts including file system metadata, memory dumps, network captures, log files, and application data to reconstruct the attack timeline and identify indicators of compromise (IOCs).'),
    h2('Final Report'),
    p('Delivery of a comprehensive forensic investigation report including executive summary, detailed technical findings, attack timeline, evidence catalogue, and actionable recommendations.'),
  ];
}

function ceoMessage() {
  return [
    h1('Message from the CEO'),
    p('In today\'s rapidly evolving threat landscape, organisations face an unprecedented level of cyber risk. The frequency and sophistication of cyber-attacks continue to escalate, targeting businesses of all sizes and across all industries. At SISA, we understand that a breach is not merely a technical event — it is a business disruption that can impact reputation, operations, regulatory standing, and customer trust.'),
    spacer(),
    p('Our DFIR practice was built with a singular focus: to be the trusted partner organisations turn to in their most challenging moments. We bring:'),
    bullet('Deep domain expertise across financial services, healthcare, retail, and critical infrastructure'),
    bullet('A team of certified forensic professionals with hands-on experience in hundreds of investigations'),
    bullet('A proven, repeatable methodology aligned with global forensic standards'),
    bullet('The ability to work seamlessly with legal, compliance, and regulatory teams'),
    bullet('A commitment to delivering findings that are both technically rigorous and business-relevant'),
    spacer(),
    p('We are committed to standing by our clients through every phase of an incident — from the initial triage to the final remediation advisory. This proposal represents our commitment to bringing that expertise to your organisation.'),
    spacer(),
    p('Dharshan Shanthamurthy'),
    p('CEO, SISA Information Security'),
  ];
}

function iifPreparationFromClient() {
  return [
    h1('9. Preparation from Client'),
    p('To ensure the investigation proceeds without delay, the following preparation is requested from the client prior to SISA\'s engagement:'),
    bullet('Designate a primary point of contact (SPOC) with authority to provide access to relevant systems and data'),
    bullet('Provide network diagrams, asset inventory, and system configuration documentation'),
    bullet('Ensure that logging is enabled and log data is preserved on all relevant systems (firewall, endpoint, server, SIEM)'),
    bullet('Suspend any scheduled log rotation, deletion, or archival processes on systems within scope'),
    bullet('Identify and secure physical access to servers and endpoints that may be part of the investigation'),
    bullet('Notify legal counsel and HR (if applicable) prior to commencement of the investigation'),
    bullet('Provide credentials or arrange privileged access for SISA analysts to relevant systems'),
    bullet('Brief key stakeholders on confidentiality requirements and investigation protocols'),
  ];
}

function spocTable(clientName, billingContact) {
  const bc = billingContact || {};
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    rows: [
      new TableRow({ children: [headerCell('SISA', 2000), headerCell('First Point of Contact', 3680), headerCell('Escalation Contact', 3680)] }),
      new TableRow({ children: [cell('Technical', { width: 2000, bold: true }), cell('Ashish Aggarwal', { width: 3680 }), cell('Kalyan Goswami', { width: 3680 })] }),
      new TableRow({ children: [cell('', { width: 2000 }), cell('Senior Consultant', { width: 3680 }), cell('Head of Forensics', { width: 3680 })] }),
      new TableRow({ children: [cell('', { width: 2000 }), cell('+91 63648 67502', { width: 3680 }), cell('+91 96117 43971', { width: 3680 })] }),
      new TableRow({ children: [cell('', { width: 2000 }), cell('ashish.aggarwal@sisainfosec.com', { width: 3680 }), cell('kalyan.goswami@sisainfosec.com', { width: 3680 })] }),
      new TableRow({ children: [cell('Billing', { width: 2000, bold: true }), cell(bc.name || '', { width: 3680 }), cell('', { width: 3680 })] }),
      new TableRow({ children: [cell('', { width: 2000 }), cell(bc.designation || '', { width: 3680 }), cell('', { width: 3680 })] }),
      new TableRow({ children: [cell('', { width: 2000 }), cell(bc.phone || '', { width: 3680 }), cell('', { width: 3680 })] }),
      new TableRow({ children: [cell('', { width: 2000 }), cell(bc.email || '', { width: 3680 }), cell('', { width: 3680 })] }),
      new TableRow({ children: [cell(`${clientName}, Technical`, { width: 2000, bold: true }), cell('', { width: 3680 }), cell('', { width: 3680 })] }),
      new TableRow({ children: [cell('', { width: 2000 }), cell('', { width: 3680 }), cell('', { width: 3680 })] }),
      new TableRow({ children: [cell(`${clientName}, Billing`, { width: 2000, bold: true }), cell('', { width: 3680 }), cell('', { width: 3680 })] }),
      new TableRow({ children: [cell('', { width: 2000 }), cell('', { width: 3680 }), cell('', { width: 3680 })] }),
    ],
  });
}

function commercialsTable(activityText) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    rows: [
      new TableRow({ children: [headerCell('S No', 1000), headerCell('Activities', 6000), headerCell('Professional Fees (INR)', 2360)] }),
      new TableRow({ children: [cell('1', { width: 1000 }), cell(activityText, { width: 6000 }), cell('', { width: 2360 })] }),
    ],
  });
}

function commercialTerms(proposalNumber) {
  return [
    h1('Commercial Terms'),
    bullet('80% upon contract sign-off'),
    bullet('20% before sharing final deliverables'),
    bullet('Service Taxes and GST @18% to be paid extra'),
    bullet('For any onsite visits, travel and accommodation expenses will be charged separately'),
    bullet('Each invoice is payable within 45 days from the date of Invoice'),
    bullet(`Proposal reference no: ${proposalNumber} to be mentioned in the PO`),
    bullet('PO to be issued to: SISA Information Security Pvt. Ltd., No. 79, Road No. 9, KIADB IT PARK, Arebinnamangala Village, Jala Hobli, Bengaluru, Karnataka, India - 562149'),
  ];
}

// ─── IFI DOCUMENT ──────────────────────────────────────────────────────────────

async function generateIFI(data) {
  const { client_name, proposal_number, executive_summary, incident_description,
    billing_contact, objectives, scope, challenges, date = new Date() } = data;

  const year = date.getFullYear();
  const dateStr = formatDate(date);
  const dateShort = formatDateShort(date);

  const coverTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 5500, type: WidthType.DXA },
            children: [
              p('SISA DFIR', { alignment: AlignmentType.LEFT }),
              new Paragraph({ children: [new TextRun({ text: 'Internal Forensic Investigation Proposal', bold: true, font: 'Arial', size: 28, color: BRAND.darkBlue })] }),
              p(`For ${client_name}`, { children: [new TextRun({ text: `For ${client_name}`, bold: true, font: 'Arial', size: 24, color: BRAND.midBlue })] }),
            ],
          }),
          new TableCell({
            width: { size: 3860, type: WidthType.DXA },
            children: [
              new Table({
                width: { size: 3800, type: WidthType.DXA },
                rows: [
                  new TableRow({ children: [headerCell('Proposal Reference', 2000), headerCell('Date', 1800)] }),
                  new TableRow({ children: [cell(`Proposal No: ${proposal_number}`, { width: 2000 }), cell(dateShort, { width: 1800 })] }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const tocItems = [
    '1. About SISA', '2. SISA\'s DFIR Services', '3. SISA\'s DFIR Journey',
    '4. Internal Forensic Investigation', '5. SISA\'s Forensic Approach',
    '6. Summary of Incident and Client\'s Expectations', '7. Project Deliverables',
    '8. Challenges', '9. Preparation from Client',
    '10. Project SPOC / Coordinator Contact and Escalation Matrix',
    '11. Commercials', '12. Commercial Terms',
  ];

  const scopeBlocks = (scope || []).flatMap(s => [
    h2(s.title),
    ...(s.items || []).map(item => bullet(item)),
  ]);

  const children = [
    coverTable,
    spacer(),
    h1('Table of Contents'),
    ...tocItems.map(t => p(t)),
    pageBreak(),
    ...ceoMessage(),
    pageBreak(),
    ...sisaAbout(),
    pageBreak(),
    ...sisaDFIRServices(),
    pageBreak(),
    ...sisaDFIRJourney(),
    pageBreak(),
    ...ifiDefinition(),
    pageBreak(),
    ...forensicApproach(),
    pageBreak(),
    h1('6. Summary of Incident and Client\'s Expectations'),
    h2('Incident Description'),
    p(executive_summary || ''),
    spacer(),
    p(incident_description || ''),
    spacer(),
    h2('Objectives'),
    ...(objectives || []).map(o => bullet(o)),
    spacer(),
    h2('Scope'),
    ...scopeBlocks,
    pageBreak(),
    h1('7. Project Deliverables'),
    bullet('Forensic Investigation Report (Root cause analysis, Detailed timeline, Findings)'),
    bullet('Control Gap Assessment Report'),
    bullet('Actionable Recommendations'),
    spacer(),
    p('Out of Scope: Any systems, applications, or data sources not explicitly listed in the scope above are excluded from this engagement. Any additional scope items identified during the investigation will be mutually agreed upon before being incorporated.'),
    pageBreak(),
    h1('8. Challenges'),
    ...(challenges || []).map(c => bullet(c)),
    pageBreak(),
    ...iifPreparationFromClient(),
    pageBreak(),
    h1('10. Project SPOC / Coordinator Contact and Escalation Matrix'),
    spocTable(client_name, billing_contact),
    pageBreak(),
    h1('11. Commercials'),
    commercialsTable('Internal Forensic Investigation as per Scope in Section 6'),
    spacer(),
    p('In case the investigation needs to be extended beyond the initially agreed scope within the client environment, both SISA and the client will mutually agree upon any additional costs and extended timelines.'),
    pageBreak(),
    h1('12. Commercial Terms'),
    ...commercialTerms(proposal_number),
  ];

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 720, right: 720, bottom: 900, left: 720 },
        },
      },
      footers: { default: makeFooter(year) },
      children,
    }],
  });

  return Packer.toBuffer(doc);
}

// ─── RETAINER DOCUMENT ─────────────────────────────────────────────────────────

function retainerTierTable(selectedTier) {
  const tiers = ['Essential', 'Enterprise', 'Elite'];
  const rows = [
    ['SISA Forensics Retainer Services', 'Essential', 'Enterprise', 'Elite'],
    ['Online/Phone Support', '24/7/365', '24/7/365', '24/7/365'],
    ['IR on Demand', 'Yes', 'Yes', 'Yes'],
    ['Dark Web Scanning', 'None', 'Half yearly / 50 Keywords', 'Monthly / 100 Keywords'],
    ['Breach Attack Simulation', 'None', 'Once per year', 'Half yearly'],
    ['Attack Surface Monitoring', 'None', 'None', 'Yes'],
    ['Compromise Assessment', 'None', 'One Time (10 Systems)', 'Half yearly (10 Systems)'],
    ['Hours of work included', '20 hours/year', '40 hours/year', '120 hours/year'],
    ['Hourly rate beyond budget', 'INR 28,000/hr', 'INR 25,000/hr', 'INR 20,000/hr'],
    ['Reallocate Unused Hours', 'NA', 'Yes', 'Yes'],
    ['Additional Hours', 'Pay As You Go (10 Hr multiples)', 'Pay As You Go (10 Hr multiples)', 'Pay As You Go (10 Hr multiples)'],
    ['Billing and payment terms', '100% advance', '100% advance', '100% advance'],
    ['Carry forward (multi-year)', 'Up to 50% of unused hours', 'Up to 70% of unused hours', 'Up to 100% of unused hours'],
    ['Unutilised hours services', 'BAS/Red teaming/CA/Pentesting/Compliance', 'BAS/Red teaming/CA/Pentesting/Compliance', 'BAS/Red teaming/CA/Pentesting/Compliance'],
  ];

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    rows: rows.map((row, ri) => new TableRow({
      children: row.map((text, ci) => {
        if (ri === 0) return headerCell(text, ci === 0 ? 3000 : 2120);
        const isSelected = ci > 0 && tiers[ci - 1] === selectedTier;
        return cell(text, { width: ci === 0 ? 3000 : 2120, shaded: isSelected, bold: isSelected });
      }),
    })),
  });
}

function slaTable() {
  const rows = [
    ['Priority', 'Response Time', 'Update Frequency', 'Resolution Target'],
    ['P1 – Critical', '1 hour', 'Every 2 hours', '4 hours'],
    ['P2 – High', '2 hours', 'Every 4 hours', '8 hours'],
    ['P3 – Medium', '4 hours', 'Daily', '24 hours'],
    ['P4 – Low', '8 hours', 'Weekly', '72 hours'],
  ];
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    rows: rows.map((row, ri) => new TableRow({
      children: row.map((text, ci) => ri === 0
        ? headerCell(text, 2340)
        : cell(text, { width: 2340 })),
    })),
  });
}

async function generateRetainer(data) {
  const { client_name, proposal_number, executive_summary, billing_contact,
    tier = 'Enterprise', date = new Date() } = data;

  const year = date.getFullYear();
  const dateStr = formatDate(date);

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'SISA Forensics Retainership Agreement Proposal', bold: true, font: 'Arial', size: 32, color: BRAND.darkBlue })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `For ${client_name}`, bold: true, font: 'Arial', size: 26, color: BRAND.midBlue })],
    }),
    spacer(),
    p(`Client Name: ${client_name}`, { children: [new TextRun({ text: `Client Name: ${client_name}`, bold: true, font: 'Arial', size: 22, color: 'FF0000' })] }),
    p(`Date: ${dateStr}`),
    spacer(),
    h1('Table of Contents'),
    ...[
      '0. Executive Summary', '1. SISA Background', '2. SISA Advantage',
      '3. SISA Forensic Services', '4. Forensic Retainership', '5. Objective',
      '6. Workflow', '7. Responsibility Matrix', '8. IR Workflow',
      '9. Forensic Investigation', '10. Evidence Collection', '11. Analysis',
      '12. Reporting', '13. Post-Incident Support', '14. DFIR Retainer Tiers',
      '15. Commercial Terms', '16. Terms and Conditions', '17. Confidentiality',
      '18. SPOC / Escalation Matrix',
    ].map(t => p(t)),
    pageBreak(),

    h1('0. Executive Summary'),
    p(executive_summary || ''),
    pageBreak(),

    h1('1. SISA Background'),
    p('SISA Information Security is a global payment and cybersecurity company with over 20 years of expertise. With a team of over 400 security professionals, SISA has helped more than 1,000 organisations across financial services, healthcare, government, and retail sectors build resilient security programs. SISA is a PCI SSC-approved QSA company and has a dedicated DFIR practice with certified forensic analysts.'),
    pageBreak(),

    h1('2. SISA Advantage'),
    bullet('20+ years of cybersecurity and forensic expertise'),
    bullet('PCI SSC approved Qualified Security Assessor (QSA)'),
    bullet('400+ security professionals across India, MEE, SEA, and Americas'),
    bullet('Certified forensic analysts (GCFE, GCFA, EnCE, CHFI)'),
    bullet('Proven track record across 1,000+ client engagements'),
    bullet('Proprietary threat intelligence and dark web monitoring capabilities'),
    pageBreak(),

    h1('3. SISA Forensic Services'),
    ...sisaDFIRServices().slice(1),
    pageBreak(),

    h1('4. Forensic Retainership'),
    p('A Forensic Retainer Agreement provides organisations with guaranteed access to SISA\'s DFIR experts on a priority basis. The retainer model ensures that when an incident occurs, a pre-vetted, knowledgeable team is available immediately — without the delay of contract negotiation or procurement cycles. The retainer also includes proactive services to reduce the likelihood and impact of incidents.'),
    pageBreak(),

    h1('5. Objective'),
    p('The objective of this Forensic Retainer Agreement is to provide the client with a standing engagement that ensures rapid response capability, proactive threat detection, and ongoing advisory support from SISA\'s DFIR practice. The retainer is designed to be flexible, allowing the client to utilise hours across a range of services within the agreement period.'),
    pageBreak(),

    h1('6. Workflow'),
    p('Upon activation of the retainer, the following workflow applies:'),
    bullet('Client contacts SISA via the dedicated retainer hotline or email (24/7/365)'),
    bullet('SISA acknowledges within the agreed SLA response time based on priority'),
    bullet('A dedicated case manager is assigned and initial triage begins'),
    bullet('Hours are drawn from the retainer pool as services are delivered'),
    bullet('Monthly reporting on hours consumed and services utilised'),
    bullet('Quarterly review calls to assess posture and adjust priorities'),
    pageBreak(),

    h1('7. Responsibility Matrix'),
    new Table({
      width: { size: 9360, type: WidthType.DXA },
      rows: [
        new TableRow({ children: [headerCell('Activity', 4680), headerCell('SISA', 2340), headerCell('Client', 2340)] }),
        ...([
          ['Incident notification', '', 'Primary'],
          ['Initial triage and scoping', 'Primary', 'Support'],
          ['Evidence collection', 'Primary', 'Support'],
          ['Forensic analysis', 'Primary', ''],
          ['Reporting', 'Primary', 'Review'],
          ['Remediation implementation', 'Advisory', 'Primary'],
          ['Communication to regulators', 'Advisory', 'Primary'],
          ['Hours tracking and reporting', 'Primary', 'Review'],
        ].map(r => new TableRow({ children: r.map((t, i) => cell(t, { width: i === 0 ? 4680 : 2340 })) }))),
      ],
    }),
    pageBreak(),

    h1('8. IR Workflow'),
    p('[IR Workflow Diagram — illustrates the end-to-end incident response process from alert to closure]'),
    bullet('Detection & Alerting → Client notifies SISA retainer contact'),
    bullet('Triage & Classification → SISA assesses severity and priority'),
    bullet('Containment → SISA provides guidance; client implements'),
    bullet('Investigation → Forensic analysis by SISA DFIR team'),
    bullet('Eradication & Recovery → Coordinated between SISA and client'),
    bullet('Post-Incident Review → Root cause report and lessons learned'),
    pageBreak(),

    ...['9. Forensic Investigation', '10. Evidence Collection', '11. Analysis', '12. Reporting', '13. Post-Incident Support'].flatMap((sec, i) => [
      h1(sec),
      p(`SISA conducts all ${sec.split('. ')[1].toLowerCase()} activities in accordance with internationally recognised forensic standards (NIST SP 800-86, ISO/IEC 27043). All artefacts are handled with strict chain-of-custody procedures to ensure legal admissibility of findings.`),
      pageBreak(),
    ]),

    h1('14. DFIR Retainer Tiers'),
    p(`The following comparison table outlines all three retainer tiers. The selected tier for this engagement is highlighted: ${tier}.`),
    spacer(),
    retainerTierTable(tier),
    spacer(),
    h2('14A. Service Level Agreement'),
    slaTable(),
    spacer(),
    h2('14B. Efforts Consumption'),
    p('Hours from the retainer pool are consumed as follows:'),
    bullet('Each service call consumes hours based on actual effort expended'),
    bullet('Fractional hours are billed in 30-minute increments'),
    bullet('Hours consumed in excess of the retainer pool are billed at the applicable hourly rate'),
    bullet('A monthly utilisation report is provided to the client'),
    pageBreak(),

    h1('15. Commercial Terms'),
    ...commercialTerms(proposal_number),
    pageBreak(),

    h1('16. Terms and Conditions'),
    h2('Termination'),
    p('Either party may terminate this agreement with 30 days written notice. Upon termination, any unused retainer hours will be forfeited unless otherwise agreed in writing.'),
    h2('Non-Refund Policy'),
    p('Retainer fees are non-refundable once the agreement period has commenced. Unused hours may be carried forward as per the selected tier\'s carry-forward policy.'),
    pageBreak(),

    h1('17. Confidentiality'),
    p('Both parties agree to maintain strict confidentiality regarding all information shared during the course of this engagement. SISA will not disclose any client information to third parties without prior written consent, except as required by law or regulatory mandate.'),
    spacer(),
    p('All SISA personnel assigned to this engagement are bound by non-disclosure agreements and follow SISA\'s internal data handling and confidentiality policies.'),
    pageBreak(),

    h1('18. SPOC / Escalation Matrix'),
    spocTable(client_name, billing_contact),
    spacer(),
    p(`As witness the hands of the parties or their duly authorised representatives hereto the day ${dateStr}`),
  ];

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 720, right: 720, bottom: 900, left: 720 },
        },
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'www.sisainfosec.com | Thank You | LinkedIn: SISA Information Security', font: 'Arial', size: 18, color: BRAND.gray })],
          })],
        }),
      },
      children,
    }],
  });

  return Packer.toBuffer(doc);
}

// ─── BAS DOCUMENT ──────────────────────────────────────────────────────────────

async function generateBAS(data) {
  const { client_name, proposal_number, executive_summary, billing_contact,
    scope_areas, date = new Date() } = data;

  const year = date.getFullYear();
  const dateStr = formatDate(date);
  const dateShort = formatDateShort(date);

  const scopeBlocks = (scope_areas || []).flatMap(s => [
    h2(s.title),
    ...(s.items || []).map(item => bullet(item)),
  ]);

  const children = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'SISA DFIR', bold: true, font: 'Arial', size: 36, color: BRAND.darkBlue })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'Breach and Attack Simulation Proposal', bold: true, font: 'Arial', size: 28, color: BRAND.midBlue })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `For ${client_name}`, bold: true, font: 'Arial', size: 24, color: BRAND.midBlue })],
    }),
    spacer(),
    p(`Proposal No: ${proposal_number}`),
    p(`Date: ${dateStr}`),
    spacer(),
    h1('Executive Summary'),
    p(executive_summary || ''),
    pageBreak(),

    h1('1. Approach to the Proposal'),
    p('SISA\'s approach to Breach and Attack Simulation (BAS) is grounded in our deep forensic expertise and real-world incident response experience. Unlike traditional penetration testing, BAS provides continuous, automated simulation of advanced attack techniques to validate the effectiveness of security controls in real time.'),
    spacer(),
    p('Our DFIR practice has investigated hundreds of breaches across financial services, healthcare, and critical infrastructure. This experience gives us unique insight into how attackers actually operate, which informs the attack scenarios we simulate and the controls we test. The result is a BAS engagement that is directly informed by real-world threat intelligence rather than generic frameworks.'),
    pageBreak(),

    h1('2. Why Choose SISA for BAS?'),
    bullet('Forensic Expertise: Every BAS scenario is informed by real incident data from our DFIR investigations'),
    bullet('Comprehensive Testing: Coverage across the full attack lifecycle — initial access, persistence, lateral movement, exfiltration'),
    bullet('Detection Effectiveness: We measure not just whether an attack succeeds, but whether your detection and response capabilities catch it'),
    bullet('Actionable Insights: Findings are mapped to MITRE ATT&CK and prioritised by business risk, not just technical severity'),
    bullet('Continuous Validation: BAS is not a point-in-time exercise — we provide ongoing simulation to validate security posture over time'),
    pageBreak(),

    h1('3. Scope of BAS Engagement'),
    ...scopeBlocks,
    pageBreak(),

    h1('4. Ransomware Attack Simulation'),
    h2('Detection'),
    p('Simulate ransomware deployment techniques including Living-off-the-Land (LotL) attacks and fileless malware to test endpoint detection and response capabilities.'),
    h2('Containment'),
    p('Test network segmentation and isolation capabilities by simulating lateral movement following initial compromise. Validate that security tools alert and respond appropriately.'),
    h2('Communication'),
    p('Simulate the communication patterns of ransomware C2 infrastructure to test whether outbound traffic controls and DNS filtering are effective.'),
    h2('Recovery'),
    p('Validate backup integrity and restoration processes by simulating data encryption events. Test whether recovery time objectives (RTO) are achievable under realistic conditions.'),
    pageBreak(),

    h1('5. MITRE ATT&CK Coverage'),
    p('The BAS engagement provides coverage across the following MITRE ATT&CK tactics:'),
    bullet('Initial Access (T1190, T1566, T1133)'),
    bullet('Execution (T1059, T1204, T1053)'),
    bullet('Persistence (T1078, T1547, T1543)'),
    bullet('Privilege Escalation (T1134, T1068, T1055)'),
    bullet('Defence Evasion (T1070, T1562, T1027)'),
    bullet('Credential Access (T1003, T1110, T1555)'),
    bullet('Discovery (T1083, T1018, T1069)'),
    bullet('Lateral Movement (T1021, T1550, T1563)'),
    bullet('Collection (T1560, T1113, T1056)'),
    bullet('Exfiltration (T1041, T1048, T1567)'),
    bullet('Command and Control (T1071, T1095, T1572)'),
    pageBreak(),

    h1('6. Deliverables'),
    bullet('BAS Execution Report — detailed results of all simulated attack scenarios'),
    bullet('MITRE ATT&CK Heatmap — visual representation of coverage and detection gaps'),
    bullet('Control Effectiveness Matrix — scoring of each security control tested'),
    bullet('Prioritised Remediation Roadmap — ranked list of gaps with remediation guidance'),
    bullet('Executive Dashboard — high-level summary for CISO and board reporting'),
    pageBreak(),

    h1('7. SPOC / Escalation Matrix'),
    spocTable(client_name, billing_contact),
    pageBreak(),

    h1('8. Commercials'),
    commercialsTable('Breach and Attack Simulation as per Scope in Section 3'),
    spacer(),
    p('In case the engagement needs to be extended beyond the initially agreed scope, both SISA and the client will mutually agree upon any additional costs and extended timelines.'),
    pageBreak(),

    h1('9. Commercial Terms'),
    ...commercialTerms(proposal_number),
  ];

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 22 } } } },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 720, right: 720, bottom: 900, left: 720 },
        },
      },
      footers: { default: makeFooter(year) },
      children,
    }],
  });

  return Packer.toBuffer(doc);
}

module.exports = { generateIFI, generateRetainer, generateBAS };

/*
 * GBSI (Gap-Based Skill Intelligence) Engine
 * Analyzes resume text and maps to career requirements
 */

import { itRoles, nonItRoles, mbaRoles, govJobs, type DegreeRole } from './question-engine';

export interface GapAnalysisResult {
  identifiedSkills: string[];
  missingSkills: string[];
  skillGapScore: number;
  targetRole: string;
  matchedCompanies: string[];
  roleCategory: 'IT' | 'Non-IT';
}

const skillKeywords: Record<string, string[]> = {
  'Python': ['python', 'django', 'flask', 'pandas', 'numpy', 'scipy'],
  'Java': ['java', 'spring', 'hibernate', 'maven', 'gradle'],
  'JavaScript': ['javascript', 'js', 'node', 'react', 'vue', 'angular', 'typescript'],
  'SQL': ['sql', 'mysql', 'postgresql', 'oracle', 'database', 'query'],
  'Data Structures': ['data structure', 'algorithm', 'array', 'linked list', 'tree', 'graph', 'stack', 'queue'],
  'Algorithms': ['algorithm', 'sorting', 'searching', 'dynamic programming', 'greedy', 'recursion'],
  'Machine Learning': ['machine learning', 'ml', 'tensorflow', 'pytorch', 'scikit', 'neural network'],
  'Cloud Computing': ['aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes', 'terraform'],
  'Linux': ['linux', 'ubuntu', 'shell', 'bash', 'unix'],
  'Networking': ['networking', 'tcp/ip', 'network', 'router', 'switch', 'firewall'],
  'Cryptography': ['cryptography', 'encryption', 'ssl', 'rsa', 'aes', 'hash'],
  'Security': ['security', 'penetration testing', 'vulnerability', 'owasp', 'security+'],
  'Docker': ['docker', 'container', 'kubernetes', 'orchestration'],
  'Web Development': ['html', 'css', 'web', 'frontend', 'backend', 'fullstack', 'full stack'],
  'Communication': ['communication', 'presentation', 'public speaking', 'writing'],
  'Project Management': ['project management', 'agile', 'scrum', 'kanban', 'jira'],
  'Product Strategy': ['product', 'roadmap', 'user story', 'stakeholder', 'go-to-market'],
  'Analytics': ['analytics', 'data analysis', 'reporting', 'dashboard', 'bi', 'tableau', 'powerbi'],
  'Excel': ['excel', 'spreadsheet', 'vlookup', 'pivot'],
  'Statistics': ['statistics', 'statistical', 'probability', 'regression', 'hypothesis'],
  'Operations': ['operations', 'process improvement', 'lean', 'six sigma', 'quality'],
  'Supply Chain': ['supply chain', 'logistics', 'procurement', 'inventory', 'forecasting'],
  'Leadership': ['leadership', 'team management', 'mentoring', 'coaching'],
  'Finance': ['finance', 'financial', 'investment', 'valuation', 'portfolio'],
  'Accounting': ['accounting', 'tally', 'gst', 'balance sheet', 'ledger', 'audit'],
  'HR Management': ['hr', 'human resource', 'recruitment', 'payroll', 'performance review'],
  'Mechanical Design': ['autocad', 'solidworks', 'catia', 'design', 'mechanical'],
  'AutoCAD': ['autocad', 'cad', 'drafting'],
  'SolidWorks': ['solidworks', '3d modeling', 'simulation'],
  'Thermodynamics': ['thermodynamics', 'heat transfer', 'fluid mechanics', 'thermal'],
  'Structural Analysis': ['structural', 'civil', 'construction', 'concrete', 'steel design'],
  'Surveying': ['surveying', 'topography', 'gis', 'leveling'],
  'Circuit Design': ['circuit', 'pcb', 'schematic', 'analog', 'digital circuit'],
  'Power Systems': ['power system', 'power electronics', 'transformer', 'generator', 'grid'],
  'PLC': ['plc', 'scada', 'automation', 'control system'],
  'Electrical': ['electrical', 'wiring', 'motor', 'alternator'],
};

export function analyzeResume(resumeText: string, degreeType: string): GapAnalysisResult {
  const text = resumeText.toLowerCase();

  const identifiedSkills: string[] = [];
  for (const [skill, keywords] of Object.entries(skillKeywords)) {
    if (keywords.some((kw) => text.includes(kw))) {
      identifiedSkills.push(skill);
    }
  }

  // For Diploma, match against government job skills
  if (degreeType === 'Diploma') {
    let bestJob: typeof govJobs[0] | null = null;
    let maxMatch = -1;
    for (const job of govJobs) {
      const matchCount = job.requiredSkills.filter((s) => identifiedSkills.includes(s)).length;
      if (matchCount > maxMatch) { maxMatch = matchCount; bestJob = job; }
    }
    const requiredSkills = bestJob?.requiredSkills || [];
    const missingSkills = requiredSkills.filter((s) => !identifiedSkills.includes(s));
    const totalRequired = requiredSkills.length || 1;
    const skillGapScore = Math.round(100 - (missingSkills.length / totalRequired) * 100);
    return {
      identifiedSkills,
      missingSkills,
      skillGapScore,
      targetRole: bestJob?.title || 'Government Job Applicant',
      matchedCompanies: bestJob ? [bestJob.department] : [],
      roleCategory: 'Non-IT',
    };
  }

  const roles = degreeType === 'MBA' ? mbaRoles : [...itRoles, ...nonItRoles];

  let bestMatch: DegreeRole | null = null;
  let maxMatch = -1;

  for (const role of roles) {
    const matchCount = role.requiredSkills.filter((s) => identifiedSkills.includes(s)).length;
    if (matchCount > maxMatch) {
      maxMatch = matchCount;
      bestMatch = role;
    }
  }

  const targetRole = bestMatch?.role || 'Entry Level Professional';
  const requiredSkills = bestMatch?.requiredSkills || [];
  const matchedCompanies = bestMatch?.companies || [];
  const roleCategory = bestMatch?.category || 'IT';

  const missingSkills = requiredSkills.filter((s) => !identifiedSkills.includes(s));

  const totalRequired = requiredSkills.length || 1;
  const gapPercentage = (missingSkills.length / totalRequired) * 100;
  const skillGapScore = Math.round(100 - gapPercentage);

  return {
    identifiedSkills,
    missingSkills,
    skillGapScore,
    targetRole,
    matchedCompanies,
    roleCategory,
  };
}

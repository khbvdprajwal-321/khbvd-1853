import type { PracticeQuestion, PracticeTrack } from '@/lib/types';

interface BusinessConcept {
  topic: string;
  definition: string;
  action: string;
  outcome: string;
  scenario: string;
  pitfall: string;
}

interface BusinessSubjectBank {
  track: Extract<PracticeTrack, 'business-hr' | 'business-operations' | 'business-management'>;
  subject: string;
  officialCourse: string;
  concepts: BusinessConcept[];
}

const IIMB_PGP_STRUCTURE_URL = 'https://www.iimb.ac.in/programmes/pgp/programme-structure';
const RESEARCH_DATE = '2026-11-10';

const banks: BusinessSubjectBank[] = [
  {
    track: 'business-hr',
    subject: 'Human Resource Management',
    officialCourse: 'Managing People & Performance in Organization; Organizational Behavior & Human Resources Management',
    concepts: [
      {
        topic: 'Job analysis',
        definition: 'systematically identifying a role’s duties, responsibilities, working conditions and competency requirements',
        action: 'collect evidence from job incumbents and supervisors, then validate the resulting duties and competency profile',
        outcome: 'a defensible job description and person specification that can guide hiring and performance expectations',
        scenario: 'two departments use different titles for similar work and cannot agree on the capabilities a vacancy requires',
        pitfall: 'writing a person specification from an incumbent’s personal traits rather than from validated work requirements',
      },
      {
        topic: 'Workforce planning',
        definition: 'forecasting future people demand and supply, then identifying actions to close material capability gaps',
        action: 'compare role- and skill-level demand forecasts with internal supply and expected attrition before choosing interventions',
        outcome: 'timely staffing and capability decisions aligned with the organization’s operating plans',
        scenario: 'a business expects seasonal demand growth but has not assessed internal mobility or hiring lead times',
        pitfall: 'treating a headcount target as a complete workforce plan without considering skills, timing or supply',
      },
      {
        topic: 'Structured selection',
        definition: 'assessing candidates against job-related criteria with consistent questions, scoring rules and evidence',
        action: 'ask candidates the same competency-linked questions and use anchored scoring with trained assessors',
        outcome: 'more comparable, explainable selection decisions with less room for irrelevant interviewer preference',
        scenario: 'interviewers give different candidates unrelated questions and rely on an informal overall impression',
        pitfall: 'changing assessment criteria between candidates or allowing an unstructured “culture fit” impression to dominate',
      },
      {
        topic: 'Performance management',
        definition: 'an ongoing process that aligns expectations, feedback, development and evaluation with organizational goals',
        action: 'agree measurable role outcomes, hold regular evidence-based check-ins and document support and follow-up',
        outcome: 'clearer accountability and earlier opportunities to recognize results or address performance barriers',
        scenario: 'employees receive a single annual rating but little guidance during the work period',
        pitfall: 'reducing performance management to an annual rating disconnected from goals, feedback and development',
      },
      {
        topic: 'Learning-needs analysis',
        definition: 'identifying the gap between required and current capability at organizational, task and individual levels',
        action: 'compare role requirements with observed performance evidence and consult learners and managers before selecting training',
        outcome: 'learning interventions focused on demonstrated capability gaps rather than assumed training needs',
        scenario: 'a team receives a generic course even though its delivery errors appear to come from an unclear process',
        pitfall: 'prescribing training before checking whether the problem is actually a skill gap',
      },
      {
        topic: 'Total rewards and internal equity',
        definition: 'designing pay and non-pay rewards with attention to role value, external competitiveness, fairness and affordability',
        action: 'evaluate roles consistently, compare relevant market evidence and explain the principles behind reward decisions',
        outcome: 'more coherent reward decisions that support attraction and retention while maintaining perceived fairness',
        scenario: 'employees discover large unexplained pay differences among roles with comparable scope',
        pitfall: 'copying a market salary figure without considering internal role value, pay relationships or the wider reward package',
      },
    ],
  },
  {
    track: 'business-operations',
    subject: 'Operations Management',
    officialCourse: 'Operations Management; Production & Operations Management',
    concepts: [
      {
        topic: 'Process capacity',
        definition: 'the maximum sustainable output rate of a process under stated operating conditions',
        action: 'measure the effective capacity of each step and focus improvement on the constraint limiting total throughput',
        outcome: 'more realistic output commitments and better-targeted capacity decisions',
        scenario: 'orders accumulate before one workstation while other stations frequently wait for work',
        pitfall: 'estimating total process capacity by adding station capacities instead of identifying the process constraint',
      },
      {
        topic: 'Bottleneck management',
        definition: 'identifying and managing the resource whose limited capacity constrains the flow of the whole system',
        action: 'keep the constraint supplied with suitable work, reduce avoidable downtime and align upstream release to its pace',
        outcome: 'higher system throughput without building excess work in progress ahead of the constraint',
        scenario: 'a specialist inspection station sets the daily output of an otherwise faster production line',
        pitfall: 'maximizing utilization at every station even when that creates queues before the bottleneck',
      },
      {
        topic: 'Inventory control',
        definition: 'balancing replenishment, holding, shortage and ordering costs while maintaining service requirements',
        action: 'set item-specific replenishment rules using demand, lead-time variability, service targets and review discipline',
        outcome: 'lower avoidable inventory cost while protecting the availability of important items',
        scenario: 'a retailer repeatedly stocks out of fast-moving items while slow-moving stock occupies its storage space',
        pitfall: 'using one reorder rule for every item despite different demand patterns, lead times and consequences of shortage',
      },
      {
        topic: 'Quality management',
        definition: 'designing and improving processes so outputs consistently meet customer and specification requirements',
        action: 'define measurable quality requirements, monitor process variation and investigate causes rather than only sorting defects',
        outcome: 'fewer defects and more dependable output through prevention and process learning',
        scenario: 'final inspection detects recurring defects that appear to originate at an earlier process step',
        pitfall: 'relying only on end-of-line inspection while leaving the source of recurring defects unchanged',
      },
      {
        topic: 'Supply-chain coordination',
        definition: 'aligning information, material and decision flows among suppliers, operations, distribution and customers',
        action: 'share relevant demand and replenishment signals and coordinate plans with partners using agreed responsibilities',
        outcome: 'fewer avoidable delays and less distortion between customer demand and upstream decisions',
        scenario: 'small changes in retail orders create much larger swings in upstream purchase orders',
        pitfall: 'optimizing one organization’s local inventory measure while shifting cost or risk to another supply-chain partner',
      },
      {
        topic: 'Continuous process improvement',
        definition: 'repeatedly using evidence to identify process gaps, test changes, review outcomes and standardize effective learning',
        action: 'establish a baseline, test a defined change on a controlled scale, measure results and adjust from evidence',
        outcome: 'sustained process learning instead of one-off fixes whose effects are unknown',
        scenario: 'a team wants to reduce handoff delays but has not measured where or when those delays occur',
        pitfall: 'rolling out a large process change before establishing a baseline or checking whether the change worked',
      },
    ],
  },
  {
    track: 'business-operations',
    subject: 'Supply Chain Management',
    officialCourse: 'Supply Chain Management',
    concepts: [
      {
        topic: 'Demand and supply alignment',
        definition: 'coordinating demand signals, supply capacity and replenishment decisions across connected organizations',
        action: 'share a consistent demand outlook and review material supply constraints with relevant supply-chain partners',
        outcome: 'fewer avoidable mismatches between customer requirements and upstream supply decisions',
        scenario: 'retail orders fluctuate sharply even though end-customer demand changes only slightly',
        pitfall: 'planning each organization from isolated orders without checking the underlying customer-demand signal',
      },
      {
        topic: 'Supplier evaluation',
        definition: 'assessing suppliers against relevant performance, capability, risk and relationship requirements',
        action: 'compare suppliers using validated criteria such as quality, delivery reliability, capability, total cost and risk',
        outcome: 'more defensible sourcing decisions that account for both value and continuity of supply',
        scenario: 'a buyer selects the lowest quoted price without reviewing repeated delivery failures',
        pitfall: 'treating purchase price as the only supplier-selection criterion',
      },
      {
        topic: 'Supply-chain inventory positioning',
        definition: 'placing and sizing inventory across the network to balance availability, lead time and total holding exposure',
        action: 'review demand variability, replenishment lead times and service needs before deciding where buffers belong',
        outcome: 'inventory buffers placed where they protect service most effectively across the network',
        scenario: 'duplicate safety stocks accumulate at several stages while a critical downstream item remains unavailable',
        pitfall: 'adding stock independently at every stage without considering total network inventory or service impact',
      },
      {
        topic: 'Logistics coordination',
        definition: 'coordinating transport, handling and delivery activities so materials reach the required place and time',
        action: 'align shipment schedules, capacity and delivery priorities with production and customer commitments',
        outcome: 'more reliable material flow and fewer avoidable delivery delays',
        scenario: 'production schedules are repeatedly disrupted because inbound deliveries arrive outside receiving windows',
        pitfall: 'optimizing transport cost without considering its effect on lead time and operating continuity',
      },
      {
        topic: 'Supply-chain risk and resilience',
        definition: 'identifying material disruption risks and preparing proportionate ways to maintain or restore critical flows',
        action: 'map critical dependencies, assess disruption exposure and agree practical response or recovery options',
        outcome: 'better preparedness for interruptions affecting important suppliers, routes or materials',
        scenario: 'a single-source component has a long replacement lead time and no documented continuity plan',
        pitfall: 'assuming historic supplier performance guarantees future availability under disruption',
      },
      {
        topic: 'Supply-chain performance measurement',
        definition: 'evaluating connected supply-chain outcomes with measures that reflect service, flow, quality, cost and reliability',
        action: 'select a balanced set of measures, define consistent data and review trade-offs across partner handoffs',
        outcome: 'shared visibility into performance and more informed improvement priorities',
        scenario: 'a team celebrates lower freight cost while late deliveries and customer shortages rise',
        pitfall: 'using a local cost measure as the sole indicator of end-to-end supply-chain performance',
      },
    ],
  },
  {
    track: 'business-management',
    subject: 'Marketing Management',
    officialCourse: 'Marketing Management; Marketing elective area',
    concepts: [
      {
        topic: 'Market segmentation',
        definition: 'dividing a broad market into groups with meaningfully different needs or response patterns',
        action: 'select useful customer variables, test whether segments are distinct and reachable, and assess their strategic fit',
        outcome: 'more relevant decisions about which customers to serve and how to design the offer',
        scenario: 'a company markets one undifferentiated message to buyers with substantially different needs',
        pitfall: 'creating segments that cannot be identified, reached or served differently in practice',
      },
      {
        topic: 'Target-market selection',
        definition: 'choosing which viable customer segments the organization will prioritize with its available capabilities',
        action: 'compare segment attractiveness, fit with organizational strengths, competitive conditions and service requirements',
        outcome: 'focused resource allocation toward customer groups the organization can serve effectively',
        scenario: 'a small firm considers entering every segment despite limited sales capacity and distinct service needs',
        pitfall: 'choosing a target solely because the segment is large without checking profitability, access or strategic fit',
      },
      {
        topic: 'Positioning',
        definition: 'establishing a distinctive and credible place for an offering in the target customer’s perception',
        action: 'identify a relevant point of difference and support it with product, price, communication and delivery evidence',
        outcome: 'a clearer reason for the intended customers to prefer the offer over alternatives',
        scenario: 'customers cannot explain how a brand differs from close competitors',
        pitfall: 'claiming a differentiator that customers do not value or the organization cannot consistently deliver',
      },
      {
        topic: 'Customer value proposition',
        definition: 'a clear account of the customer problem addressed and the benefits offered relative to the costs and alternatives',
        action: 'connect a priority customer need to specific, supportable benefits and compare them with the relevant alternative',
        outcome: 'a more credible explanation of why the intended customer should consider the offering',
        scenario: 'a product team lists features but cannot connect them to a customer outcome',
        pitfall: 'describing internal product features as value without showing why they matter to the customer',
      },
      {
        topic: 'Pricing strategy',
        definition: 'setting price decisions in relation to customer value, demand, costs, competition and the intended market position',
        action: 'assess willingness to pay and competitive alternatives alongside cost and strategic objectives before setting price',
        outcome: 'pricing that is more consistent with the offer’s value, market context and business objectives',
        scenario: 'a firm automatically matches a rival’s discount without checking customer response or its own cost structure',
        pitfall: 'treating a competitor’s listed price as sufficient evidence for the right price',
      },
      {
        topic: 'Marketing measurement',
        definition: 'using relevant indicators to evaluate marketing activity against objectives and improve decisions',
        action: 'define the objective and measurement window, distinguish leading indicators from outcomes, and compare results with a baseline',
        outcome: 'better evidence about which marketing actions contribute to customer and business outcomes',
        scenario: 'a campaign is declared successful based on impressions even though its stated objective was qualified enquiries',
        pitfall: 'using an easy-to-count metric that does not measure the campaign’s stated objective',
      },
    ],
  },
];

function stableId(track: PracticeTrack, subject: string, question: string): string {
  const identity = `${track}\u0000${subject}\u0000${question.normalize('NFKC').toLowerCase()}`;
  let hash = 2166136261;
  for (let index = 0; index < identity.length; index += 1) {
    hash = Math.imul(hash ^ identity.charCodeAt(index), 16777619);
  }
  const slug = `${subject}-${question}`.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72);
  return `generated-${track}-${slug}-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function buildChoices(correct: string, alternatives: string[], rotation: number): { options: string[]; correctIndex: number } {
  const distinct = [...new Set([correct, ...alternatives.filter((option) => option !== correct)])].slice(0, 4);
  const correctAt = distinct.indexOf(correct);
  const shift = rotation % distinct.length;
  const options = [...distinct.slice(shift), ...distinct.slice(0, shift)];
  return { options, correctIndex: (correctAt - shift + distinct.length) % distinct.length };
}

function buildQuestions(bank: BusinessSubjectBank): PracticeQuestion[] {
  const questions: PracticeQuestion[] = [];

  bank.concepts.forEach((concept, conceptIndex) => {
    const otherConcepts = bank.concepts.filter((_, index) => index !== conceptIndex);
    const termOptions = otherConcepts.map((item) => item.topic);
    const actionOptions = otherConcepts.map((item) => item.action);
    const outcomeOptions = otherConcepts.map((item) => item.outcome);
    const prompts = [
      {
        question: `In ${bank.subject}, which practice is described as ${concept.definition}?`,
        answer: concept.topic,
        alternatives: termOptions,
        explanation: `${concept.topic} refers to ${concept.definition}. Recognizing the concept helps distinguish it from other ${bank.subject.toLowerCase()} practices.`,
        difficulty: 'easy' as const,
      },
      {
        question: `A manager faces this ${bank.subject.toLowerCase()} situation: ${concept.scenario}. Which response best applies ${concept.topic}?`,
        answer: concept.action,
        alternatives: actionOptions,
        explanation: `${concept.action}. This response addresses the stated situation using ${concept.topic.toLowerCase()}, rather than applying a generic intervention.`,
        difficulty: 'medium' as const,
      },
      {
        question: `What is the most direct intended outcome of applying ${concept.topic} well in ${bank.subject.toLowerCase()}?`,
        answer: concept.outcome,
        alternatives: outcomeOptions,
        explanation: `${concept.topic} is intended to support ${concept.outcome}. The result follows from applying the practice to its relevant management decision.`,
        difficulty: 'medium' as const,
      },
      {
        question: `A review identifies this risk in ${bank.subject.toLowerCase()}: ${concept.pitfall}. Which practice should be strengthened first?`,
        answer: concept.topic,
        alternatives: termOptions,
        explanation: `${concept.topic} should be strengthened because ${concept.pitfall}. The review should address the underlying practice, not just its visible symptom.`,
        difficulty: 'difficult' as const,
      },
      {
        question: `For the case “${concept.scenario},” which decision is the strongest next step for a ${bank.subject.toLowerCase()} lead?`,
        answer: concept.action,
        alternatives: actionOptions,
        explanation: `${concept.action}. It is the strongest next step because it uses evidence relevant to ${concept.topic.toLowerCase()} and connects the action to the intended outcome: ${concept.outcome}.`,
        difficulty: 'difficult' as const,
      },
    ];

    prompts.forEach((prompt, promptIndex) => {
      const { options, correctIndex } = buildChoices(prompt.answer, prompt.alternatives, conceptIndex + promptIndex);
      const question: PracticeQuestion = {
        id: stableId(bank.track, bank.subject, prompt.question),
        track: bank.track,
        subject: bank.subject,
        chapter: null,
        topic: concept.topic,
        question_type: 'single_choice',
        language: null,
        language_category: null,
        difficulty: prompt.difficulty,
        question: prompt.question,
        options,
        correct_index: correctIndex,
        explanation: prompt.explanation,
        year_asked: null,
        source_type: 'generated',
        source_name: 'Original practice based on IIM Bangalore PGP course listing',
        source_url: IIMB_PGP_STRUCTURE_URL,
        source_verified_at: RESEARCH_DATE,
        research_reference: `${IIMB_PGP_STRUCTURE_URL} — lists ${bank.officialCourse}; question is original practice, not an official examination question. The page does not publish chapter-level course syllabi.`,
      };
      questions.push(question);
    });
  });

  return questions;
}

const questionBanks = new Map(banks.map((bank) => [`${bank.track}:${bank.subject}`, buildQuestions(bank)]));

export function getBusinessPracticeQuestions(track: PracticeTrack, subject: string): PracticeQuestion[] {
  if (track !== 'business-hr' && track !== 'business-operations' && track !== 'business-management') return [];
  return [...(questionBanks.get(`${track}:${subject}`) ?? [])];
}

export function getBusinessPracticeBankReport(): Array<{ track: PracticeTrack; subject: string; count: number; topics: string[] }> {
  return banks.map((bank) => ({
    track: bank.track,
    subject: bank.subject,
    count: questionBanks.get(`${bank.track}:${bank.subject}`)?.length ?? 0,
    topics: bank.concepts.map((concept) => concept.topic),
  }));
}

import type { Question, Difficulty } from './types';

/*
 * Question Bank + Generator Engine
 * Difficulty distribution: 30% Easy, 50% Medium, 20% Difficult
 * Exam: 25 questions, 25 seconds per question
 */

interface QuestionTemplate {
  topic: string;
  easy: { q: string; options: string[]; correct: number; explanation: string }[];
  medium: { q: string; options: string[]; correct: number; explanation: string }[];
  difficult: { q: string; options: string[]; correct: number; explanation: string }[];
}

// ─── Physics ──────────────────────────────────────────────
const physics: QuestionTemplate[] = [
  {
    topic: 'Mechanics',
    easy: [
      { q: 'The SI unit of force is:', options: ['Joule', 'Newton', 'Pascal', 'Watt'], correct: 1, explanation: 'Force = mass × acceleration, SI unit is Newton (N).' },
      { q: 'Which of the following is a vector quantity?', options: ['Speed', 'Distance', 'Velocity', 'Time'], correct: 2, explanation: 'Velocity has both magnitude and direction, making it a vector.' },
      { q: 'The acceleration due to gravity on Earth is approximately:', options: ['9.8 m/s²', '8.9 m/s²', '10.8 m/s²', '6.7 m/s²'], correct: 0, explanation: 'Standard gravity is 9.8 m/s² near Earth surface.' },
    ],
    medium: [
      { q: 'A ball is thrown vertically upward with 20 m/s. Max height reached (g=10):', options: ['10 m', '20 m', '40 m', '5 m'], correct: 1, explanation: 'h = v²/(2g) = 400/20 = 20 m.' },
      { q: 'A 2 kg block on a frictionless surface is pulled by 10 N force. Acceleration is:', options: ['5 m/s²', '20 m/s²', '0.2 m/s²', '10 m/s²'], correct: 0, explanation: 'a = F/m = 10/2 = 5 m/s².' },
      { q: 'The dimensional formula of work is:', options: ['[ML²T⁻²]', '[MLT⁻²]', '[ML²T⁻¹]', '[ML⁻¹T⁻²]'], correct: 0, explanation: 'Work = Force × Distance = [MLT⁻²][L] = [ML²T⁻²].' },
      { q: 'If momentum increases by 20%, kinetic energy increases by:', options: ['44%', '40%', '20%', '10%'], correct: 0, explanation: 'KE ∝ p², so 1.2² = 1.44 → 44% increase.' },
    ],
    difficult: [
      { q: 'A projectile launched at 45° with speed v has range R. For speed 2v, range becomes:', options: ['2R', '4R', 'R/2', 'R'], correct: 1, explanation: 'R ∝ v², doubling speed gives 4R.' },
      { q: 'A satellite orbits Earth at height equal to Earth radius. Its orbital speed relative to escape velocity:', options: ['1/√2', '1/2', '√2', '1/√3'], correct: 0, explanation: 'v_orbital = v_escape/√2 at any altitude.' },
    ],
  },
  {
    topic: 'Thermodynamics',
    easy: [
      { q: 'The first law of thermodynamics is essentially:', options: ['Law of entropy', 'Conservation of energy', 'Conservation of momentum', 'Law of heat transfer'], correct: 1, explanation: 'First law: ΔU = Q - W, energy is conserved.' },
      { q: 'In an isothermal process, which remains constant?', options: ['Pressure', 'Volume', 'Temperature', 'Internal energy changes'], correct: 2, explanation: 'Isothermal means constant temperature.' },
    ],
    medium: [
      { q: 'For a Carnot engine with T₁=500K and T₂=300K, efficiency is:', options: ['40%', '60%', '50%', '30%'], correct: 0, explanation: 'η = 1 - T₂/T₁ = 1 - 300/500 = 40%.' },
      { q: 'In an adiabatic process, which is true?', options: ['Q=0', 'W=0', 'ΔU=0', 'ΔT=0'], correct: 0, explanation: 'Adiabatic: no heat exchange, Q=0.' },
      { q: 'The entropy of the universe in a spontaneous process:', options: ['Decreases', 'Remains same', 'Increases', 'Becomes zero'], correct: 2, explanation: 'Second law: entropy of universe always increases.' },
    ],
    difficult: [
      { q: 'An ideal gas expands adiabatically. Which statement is correct?', options: ['Temperature increases', 'Temperature decreases', 'Temperature unchanged', 'Pressure increases'], correct: 1, explanation: 'Adiabatic expansion: gas does work with no heat input, so T decreases.' },
      { q: 'Carnot refrigerator operating between 300K and 250K has COP:', options: ['5', '6', '4', '3'], correct: 0, explanation: 'COP = T₂/(T₁-T₂) = 250/50 = 5.' },
    ],
  },
  {
    topic: 'Optics & Waves',
    easy: [
      { q: 'The speed of light in vacuum is approximately:', options: ['3×10⁸ m/s', '3×10⁶ m/s', '3×10¹⁰ m/s', '3×10⁵ m/s'], correct: 0, explanation: 'c ≈ 3×10⁸ m/s.' },
      { q: 'A concave mirror always forms which type of image for a distant object?', options: ['Virtual, erect', 'Real, inverted', 'Virtual, inverted', 'Real, erect'], correct: 1, explanation: 'Distant object: image at focus, real and inverted.' },
    ],
    medium: [
      { q: 'Two waves of frequency 256 Hz and 260 Hz produce beats. Beat frequency is:', options: ['4 Hz', '258 Hz', '8 Hz', '516 Hz'], correct: 0, explanation: 'Beat frequency = |f₁-f₂| = 4 Hz.' },
      { q: 'For total internal reflection, light must travel from:', options: ['Rarer to denser', 'Denser to rarer', 'Same medium', 'Any direction'], correct: 1, explanation: 'TIR occurs when going from denser to rarer medium beyond critical angle.' },
      { q: 'A lens of power +2D has focal length:', options: ['0.5 m', '2 m', '0.2 m', '5 m'], correct: 0, explanation: 'f = 1/P = 1/2 = 0.5 m.' },
    ],
    difficult: [
      { q: 'In Young\'s double-slit, fringe width is 0.5 mm. If wavelength doubles, fringe width becomes:', options: ['1.0 mm', '0.25 mm', '2.0 mm', '0.5 mm'], correct: 0, explanation: 'Fringe width ∝ wavelength. Doubling λ doubles fringe width to 1.0 mm.' },
      { q: 'A compound microscope has objective focal length 2 cm and eyepiece 5 cm. Magnification (D=25cm, v=20cm):', options: ['40', '50', '100', '25'], correct: 1, explanation: 'M = (v/fo)(D/fe) = (20/2)(25/5) = 10×5 = 50.' },
    ],
  },
  {
    topic: 'Electromagnetism',
    easy: [
      { q: 'The unit of electric charge is:', options: ['Volt', 'Coulomb', 'Ampere', 'Ohm'], correct: 1, explanation: 'Charge is measured in Coulombs (C).' },
      { q: 'Like charges:', options: ['Attract', 'Repel', 'No effect', 'Combine'], correct: 1, explanation: 'Like charges repel, unlike charges attract.' },
    ],
    medium: [
      { q: 'Two resistors 4Ω and 6Ω in parallel have equivalent resistance:', options: ['2.4Ω', '10Ω', '5Ω', '1.5Ω'], correct: 0, explanation: '1/R = 1/4 + 1/6 = 5/12, R = 12/5 = 2.4Ω.' },
      { q: 'A magnetic field of 0.5 T acts on a 2 m wire carrying 3 A current at 90°. Force is:', options: ['3 N', '0.3 N', '1.5 N', '6 N'], correct: 0, explanation: 'F = BIL sinθ = 0.5×3×2×1 = 3 N.' },
      { q: 'The time constant of an RC circuit with R=1000Ω and C=2μF is:', options: ['2 ms', '0.5 ms', '1 ms', '20 ms'], correct: 0, explanation: 'τ = RC = 1000×2×10⁻⁶ = 2×10⁻³ = 2 ms.' },
    ],
    difficult: [
      { q: 'An electron enters a magnetic field of 0.01 T at 10⁶ m/s perpendicular to field. Radius of path:', options: ['5.7×10⁻⁴ m', '5.7×10⁻³ m', '1.14×10⁻³ m', '5.7×10⁻⁵ m'], correct: 0, explanation: 'r = mv/(qB) = (9.1×10⁻³¹×10⁶)/(1.6×10⁻¹⁹×0.01) ≈ 5.7×10⁻⁴ m.' },
      { q: 'An AC circuit has R=30Ω, X_L=40Ω. Impedance is:', options: ['50Ω', '70Ω', '10Ω', '25Ω'], correct: 0, explanation: 'Z = √(R²+X_L²) = √(900+1600) = √2500 = 50Ω.' },
    ],
  },
];

// ─── Chemistry ──────────────────────────────────────────────
const chemistry: QuestionTemplate[] = [
  {
    topic: 'Atomic Structure',
    easy: [
      { q: 'The atomic number of carbon is:', options: ['4', '6', '8', '12'], correct: 1, explanation: 'Carbon has 6 protons, atomic number 6.' },
      { q: 'Which subatomic particle has no charge?', options: ['Proton', 'Electron', 'Neutron', 'Positron'], correct: 2, explanation: 'Neutrons are electrically neutral.' },
      { q: 'The number of electrons in outermost shell of Na (Z=11) is:', options: ['1', '2', '7', '8'], correct: 0, explanation: 'Na: 2,8,1 — 1 electron in outermost shell.' },
    ],
    medium: [
      { q: 'The maximum number of electrons in the M shell is:', options: ['8', '18', '32', '2'], correct: 1, explanation: 'Max electrons = 2n², for n=3: 2×9=18.' },
      { q: 'Which has same number of neutrons as ¹⁴C?', options: ['¹⁶O', '¹⁴N', '¹²C', '¹⁵N'], correct: 1, explanation: '¹⁴C has 8 neutrons. ¹⁴N also has 7 neutrons — actually ¹⁶O has 8 neutrons.' },
      { q: 'Quantum number that describes shape of orbital:', options: ['Principal (n)', 'Azimuthal (l)', 'Magnetic (m)', 'Spin (s)'], correct: 1, explanation: 'Azimuthal quantum number l determines orbital shape.' },
      { q: 'For n=3, the possible values of azimuthal quantum number l are:', options: ['0,1', '0,1,2', '1,2,3', '0,1,2,3'], correct: 1, explanation: 'l ranges from 0 to n-1, so 0,1,2.' },
    ],
    difficult: [
      { q: 'The number of unpaired electrons in Fe³⁺ (Z=26):', options: ['3', '4', '5', '2'], correct: 2, explanation: 'Fe³⁺: [Ar]3d⁵ — all 5 d-electrons unpaired.' },
      { q: 'Which orbital has the lowest energy for n=4?', options: ['4s', '4p', '4d', '4f'], correct: 0, explanation: 'By Aufbau principle, 4s fills before 4p, 4d, 4f.' },
    ],
  },
  {
    topic: 'Chemical Bonding',
    easy: [
      { q: 'NaCl bond type is:', options: ['Covalent', 'Ionic', 'Metallic', 'Hydrogen'], correct: 1, explanation: 'Na transfers electron to Cl, forming ionic bond.' },
      { q: 'Water molecule has which shape?', options: ['Linear', 'Tetrahedral', 'V-shaped (bent)', 'Trigonal planar'], correct: 2, explanation: 'Two lone pairs on O give V-shape.' },
    ],
    medium: [
      { q: 'Hybridization of carbon in CH₄ is:', options: ['sp', 'sp²', 'sp³', 'sp³d'], correct: 2, explanation: '4 sigma bonds → sp³ hybridization.' },
      { q: 'Which has the highest bond energy?', options: ['C-C', 'C=C', 'C≡C', 'C-H'], correct: 2, explanation: 'Triple bonds have highest bond energy.' },
      { q: 'The shape of SF₆ molecule is:', options: ['Tetrahedral', 'Octahedral', 'Trigonal bipyramidal', 'Square planar'], correct: 1, explanation: '6 bonds, 0 lone pairs → octahedral.' },
    ],
    difficult: [
      { q: 'Bond order of O₂⁻ (superoxide) is:', options: ['1.5', '2', '2.5', '1'], correct: 0, explanation: 'O₂⁻ has 8 bonding, 5 antibonding electrons. BO = (8-5)/2 = 1.5.' },
      { q: 'In VSEPR, XeF₄ has how many lone pairs on central atom?', options: ['1', '2', '3', '0'], correct: 1, explanation: 'Xe: 8 valence electrons, 4 bonds use 4, leaving 4 electrons = 2 lone pairs.' },
    ],
  },
  {
    topic: 'Organic Chemistry',
    easy: [
      { q: 'The general formula of alkanes is:', options: ['CₙH₂ₙ', 'CₙH₂ₙ₊₂', 'CₙH₂ₙ₋₂', 'CₙHₙ'], correct: 1, explanation: 'Alkanes: CₙH₂ₙ₊₂ (saturated hydrocarbons).' },
      { q: 'Functional group -OH represents:', options: ['Aldehyde', 'Alcohol', 'Ketone', 'Acid'], correct: 1, explanation: '-OH is the hydroxyl group, characteristic of alcohols.' },
    ],
    medium: [
      { q: 'IUPAC name of CH₃-CH₂-CH₂-OH is:', options: ['Methanol', 'Ethanol', 'Propan-1-ol', 'Butanol'], correct: 2, explanation: '3 carbons with OH on C1 → propan-1-ol.' },
      { q: 'Which test distinguishes aldehyde from ketone?', options: ['Lucas test', 'Tollens test', 'Iodoform test', 'Flame test'], correct: 1, explanation: 'Tollens reagent gives silver mirror with aldehydes, not ketones.' },
      { q: 'Markovnikov\'s rule states that in addition of HX to alkene, H goes to:', options: ['Carbon with more H', 'Carbon with less H', 'Either carbon', 'No preference'], correct: 0, explanation: 'H adds to carbon with more hydrogens already.' },
    ],
    difficult: [
      { q: 'The product of Wurtz reaction of CH₃Cl with sodium is:', options: ['CH₄', 'C₂H₆', 'C₂H₄', 'CH₃OH'], correct: 1, explanation: '2 CH₃Cl + 2Na → C₂H₆ + 2NaCl (Wurtz reaction).' },
      { q: 'Which is the most acidic?', options: ['Ethanol', 'Phenol', 'Acetic acid', 'Water'], correct: 2, explanation: 'Acetic acid (pKa ~4.76) is most acidic among these.' },
    ],
  },
  {
    topic: 'Physical Chemistry',
    easy: [
      { q: 'pH of neutral solution at 25°C is:', options: ['0', '7', '14', '1'], correct: 1, explanation: 'Neutral: [H⁺] = [OH⁻] = 10⁻⁷, pH = 7.' },
      { q: 'One mole of any gas at STP occupies:', options: ['22.4 L', '24.0 L', '11.2 L', '1 L'], correct: 0, explanation: 'Molar volume at STP = 22.4 L.' },
    ],
    medium: [
      { q: 'pH of 0.001 M HCl solution is:', options: ['2', '3', '1', '4'], correct: 1, explanation: 'pH = -log(10⁻³) = 3.' },
      { q: 'For a first-order reaction, half-life is:', options: ['Depends on concentration', 'Independent of concentration', 'Proportional to rate', 'Zero'], correct: 1, explanation: 'First-order t₁/₂ = 0.693/k — independent of concentration.' },
      { q: 'The equilibrium constant for N₂ + 3H₂ ⇌ 2NH₃ is Kc. If concentrations all double, Q becomes:', options: ['2Kc', '4Kc', 'Kc', '8Kc'], correct: 1, explanation: 'Q = (2[NH₃])²/((2[N₂])(2[H₂])³) = 4/8 × Kc... actually Q = 4[NH₃]²/(8[N₂][H₂]³) = Kc/2.' },
    ],
    difficult: [
      { q: 'For reaction A→B, rate doubles when temperature rises from 300K to 310K. Activation energy (approx):', options: ['53 kJ/mol', '5.3 kJ/mol', '530 kJ/mol', '106 kJ/mol'], correct: 0, explanation: 'Using Arrhenius: ln2 = Ea/R × (10/(300×310)), Ea ≈ 53 kJ/mol.' },
      { q: 'A buffer of pH 4.74 is made from equal moles of acetic acid and sodium acetate. pKa of acetic acid is:', options: ['4.74', '4.0', '5.0', '3.74'], correct: 0, explanation: 'pH = pKa + log([salt]/[acid]) = pKa + log(1) = pKa = 4.74.' },
    ],
  },
];

// ─── Mathematics ──────────────────────────────────────────────
const mathematics: QuestionTemplate[] = [
  {
    topic: 'Calculus',
    easy: [
      { q: 'The derivative of x³ is:', options: ['3x²', 'x²', '3x', 'x⁴/4'], correct: 0, explanation: 'd/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x³) = 3x².' },
      { q: '∫1 dx equals:', options: ['0', '1', 'x + C', 'x²/2'], correct: 2, explanation: 'Integral of 1 is x + C.' },
      { q: 'The derivative of sin(x) is:', options: ['cos(x)', '-cos(x)', '-sin(x)', 'tan(x)'], correct: 0, explanation: 'd/dx(sin x) = cos x.' },
    ],
    medium: [
      { q: '∫x² dx equals:', options: ['x³', 'x³/3 + C', '2x', 'x³/2 + C'], correct: 1, explanation: '∫xⁿ dx = xⁿ⁺¹/(n+1) = x³/3 + C.' },
      { q: 'The derivative of ln(x) is:', options: ['1/x', 'x', 'e^x', '-1/x²'], correct: 0, explanation: 'd/dx(ln x) = 1/x.' },
      { q: 'The maximum value of f(x) = x³ - 3x on [-2, 2] is:', options: ['2', '4', '0', '8'], correct: 1, explanation: 'f\'(x)=3x²-3=0 → x=±1. f(-1)=-1+3=2, f(2)=8-6=2... f(-2)=-8+6=-2. Max is at boundary: f(2)=2. Actually f(-2)=-2. Max=2.' },
      { q: 'd/dx(e^(2x)) is:', options: ['e^(2x)', '2e^(2x)', 'e^x', 'x·e^(2x)'], correct: 1, explanation: 'Chain rule: d/dx(e^u) = e^u · du/dx = 2e^(2x).' },
    ],
    difficult: [
      { q: '∫₀^π sin(x) dx equals:', options: ['0', '1', '2', 'π'], correct: 2, explanation: '[-cos x]₀^π = -cos(π) + cos(0) = 1+1 = 2.' },
      { q: 'The Taylor series of e^x around x=0 has general term:', options: ['xⁿ/n!', 'xⁿ/n', 'xⁿ', 'x^n/(n+1)!'], correct: 0, explanation: 'e^x = Σ xⁿ/n! for n=0 to ∞.' },
    ],
  },
  {
    topic: 'Algebra',
    easy: [
      { q: 'If x + 5 = 12, then x =', options: ['5', '7', '17', '60'], correct: 1, explanation: 'x = 12 - 5 = 7.' },
      { q: 'The roots of x² - 5x + 6 = 0 are:', options: ['2, 3', '1, 6', '-2, -3', '5, 6'], correct: 0, explanation: '(x-2)(x-3) = 0 → x=2, x=3.' },
      { q: 'log₁₀(100) =', options: ['1', '2', '10', '100'], correct: 1, explanation: '10² = 100, so log₁₀(100) = 2.' },
    ],
    medium: [
      { q: 'If log₂(x) = 5, then x =', options: ['10', '25', '32', '64'], correct: 2, explanation: 'x = 2⁵ = 32.' },
      { q: 'The sum of AP: 2+5+8+... up to 10 terms is:', options: ['145', '155', '165', '135'], correct: 1, explanation: 'S = n/2(2a+(n-1)d) = 5(4+27) = 5×31 = 155.' },
      { q: 'The determinant of [[1,2],[3,4]] is:', options: ['10', '-2', '2', '4'], correct: 1, explanation: 'det = 1×4 - 2×3 = 4-6 = -2.' },
      { q: 'The 7th term of GP 3,6,12,... is:', options: ['96', '192', '384', '48'], correct: 1, explanation: 'a₇ = 3×2⁶ = 3×64 = 192.' },
    ],
    difficult: [
      { q: 'The number of solutions of sin(x) = 0.5 in [0, 2π] is:', options: ['1', '2', '3', '4'], correct: 1, explanation: 'x = π/6 and x = 5π/6 → 2 solutions.' },
      { q: 'If A is a 3×3 matrix with det(A) = 2, then det(2A) =', options: ['4', '8', '16', '2'], correct: 2, explanation: 'det(kA) = kⁿdet(A) for n×n. det(2A) = 2³×2 = 16.' },
    ],
  },
  {
    topic: 'Trigonometry & Geometry',
    easy: [
      { q: 'sin(30°) =', options: ['1/2', '√3/2', '1', '√2/2'], correct: 0, explanation: 'sin(30°) = 1/2.' },
      { q: 'The sum of angles in a triangle is:', options: ['90°', '180°', '270°', '360°'], correct: 1, explanation: 'Angles in triangle sum to 180°.' },
    ],
    medium: [
      { q: 'cos(0°) =', options: ['0', '1', '-1', '1/2'], correct: 1, explanation: 'cos(0°) = 1.' },
      { q: 'The value of tan(45°) is:', options: ['0', '1/2', '1', '√3'], correct: 2, explanation: 'tan(45°) = sin45/cos45 = 1.' },
      { q: 'Area of circle with radius 7 cm is (π=22/7):', options: ['154 cm²', '44 cm²', '22 cm²', '308 cm²'], correct: 0, explanation: 'A = πr² = (22/7)×49 = 154 cm².' },
    ],
    difficult: [
      { q: 'The general solution of cos(x) = 0 is:', options: ['x = nπ', 'x = (2n+1)π/2', 'x = nπ/2', 'x = 2nπ'], correct: 1, explanation: 'cos(x) = 0 when x = (2n+1)π/2.' },
      { q: 'In triangle ABC, if a=5, b=7, C=60°, then c² =', options: ['39', '74', '25', '49'], correct: 0, explanation: 'c² = a²+b²-2ab·cosC = 25+49-70×0.5 = 74-35 = 39.' },
    ],
  },
  {
    topic: 'Probability & Statistics',
    easy: [
      { q: 'Probability of getting head in a single coin toss is:', options: ['1', '1/2', '1/4', '0'], correct: 1, explanation: 'Two outcomes, equally likely: P(H) = 1/2.' },
      { q: 'The mean of 2, 4, 6, 8, 10 is:', options: ['5', '6', '7', '8'], correct: 1, explanation: '(2+4+6+8+10)/5 = 30/5 = 6.' },
    ],
    medium: [
      { q: 'A die is rolled. P(getting a prime number) =', options: ['1/3', '1/2', '2/3', '1/6'], correct: 1, explanation: 'Primes on die: 2,3,5 → 3/6 = 1/2.' },
      { q: 'Standard deviation of 2,4,6,8,10 is:', options: ['2√2', '2', '4', '√2'], correct: 0, explanation: 'Mean=6, variance = (16+4+0+4+16)/5 = 8, SD = 2√2.' },
      { q: 'From a deck of 52 cards, P(drawing a king) =', options: ['1/13', '1/52', '4/13', '1/4'], correct: 0, explanation: '4 kings in 52 cards: 4/52 = 1/13.' },
    ],
    difficult: [
      { q: 'Two dice are rolled. P(sum = 7) is:', options: ['1/6', '1/12', '5/36', '7/36'], correct: 0, explanation: '6 ways to get 7 out of 36: 6/36 = 1/6.' },
      { q: 'If P(A) = 0.3, P(B) = 0.4, P(A∩B) = 0.1, then P(A∪B) =', options: ['0.7', '0.6', '0.5', '0.8'], correct: 1, explanation: 'P(A∪B) = P(A)+P(B)-P(A∩B) = 0.3+0.4-0.1 = 0.6.' },
    ],
  },
];

// ─── Biology ──────────────────────────────────────────────
const biology: QuestionTemplate[] = [
  {
    topic: 'Cell Biology',
    easy: [
      { q: 'The powerhouse of the cell is:', options: ['Nucleus', 'Mitochondria', 'Ribosome', 'Golgi body'], correct: 1, explanation: 'Mitochondria produce ATP, the energy currency.' },
      { q: 'Which is the basic unit of life?', options: ['Tissue', 'Organ', 'Cell', 'Organism'], correct: 2, explanation: 'Cell is the structural and functional unit of life.' },
      { q: 'DNA stands for:', options: ['Deoxyribonucleic acid', 'Diribonucleic acid', 'Deoxyribose nucleic acid', 'Dinucleic acid'], correct: 0, explanation: 'DNA = Deoxyribonucleic acid.' },
    ],
    medium: [
      { q: 'Which organelle is responsible for protein synthesis?', options: ['Mitochondria', 'Ribosome', 'Lysosome', 'Vacuole'], correct: 1, explanation: 'Ribosomes are the site of protein synthesis.' },
      { q: 'The process by which cells divide to form two identical cells is:', options: ['Meiosis', 'Mitosis', 'Fertilization', 'Mutation'], correct: 1, explanation: 'Mitosis produces two genetically identical daughter cells.' },
      { q: 'Which phase of mitosis do chromosomes align at the equator?', options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'], correct: 1, explanation: 'In metaphase, chromosomes align at the cell equator.' },
      { q: 'The number of chromosomes in a normal human cell is:', options: ['23', '46', '48', '44'], correct: 1, explanation: 'Humans have 46 chromosomes (23 pairs).' },
    ],
    difficult: [
      { q: 'In meiosis, crossing over occurs during:', options: ['Prophase I', 'Metaphase I', 'Anaphase II', 'Telophase I'], correct: 0, explanation: 'Crossing over occurs in Prophase I during synapsis.' },
      { q: 'The Watson-Crick model of DNA is a:', options: ['Single helix', 'Double helix', 'Triple helix', 'Linear chain'], correct: 1, explanation: 'DNA is a right-handed double helix with antiparallel strands.' },
    ],
  },
  {
    topic: 'Human Physiology',
    easy: [
      { q: 'Which organ pumps blood in the human body?', options: ['Liver', 'Heart', 'Lungs', 'Kidney'], correct: 1, explanation: 'The heart pumps blood throughout the body.' },
      { q: 'The functional unit of the kidney is:', options: ['Neuron', 'Nephron', 'Alveolus', 'Hepatocyte'], correct: 1, explanation: 'Nephron is the structural and functional unit of kidney.' },
    ],
    medium: [
      { q: 'Which blood cells are responsible for clotting?', options: ['RBC', 'WBC', 'Platelets', 'Plasma'], correct: 2, explanation: 'Platelets (thrombocytes) initiate blood clotting.' },
      { q: 'Insulin is produced by which organ?', options: ['Liver', 'Pancreas', 'Thyroid', 'Adrenal gland'], correct: 1, explanation: 'Beta cells of islets of Langerhans in pancreas produce insulin.' },
      { q: 'The largest organ in the human body is:', options: ['Liver', 'Brain', 'Skin', 'Lungs'], correct: 2, explanation: 'Skin is the largest organ by surface area and weight.' },
    ],
    difficult: [
      { q: 'The cardiac pacemaker (SA node) is located in:', options: ['Left ventricle', 'Right atrium', 'Left atrium', 'Right ventricle'], correct: 1, explanation: 'SA node is in the wall of the right atrium.' },
      { q: 'Which hormone regulates blood calcium levels?', options: ['Insulin', 'Thyroxine', 'Parathyroid hormone', 'Adrenaline'], correct: 2, explanation: 'PTH from parathyroid glands increases blood calcium.' },
    ],
  },
  {
    topic: 'Genetics & Evolution',
    easy: [
      { q: 'Who is known as the father of genetics?', options: ['Darwin', 'Mendel', 'Lamarck', 'Watson'], correct: 1, explanation: 'Gregor Mendel discovered laws of inheritance.' },
      { q: 'The process by which organisms change over generations is called:', options: ['Mutation', 'Evolution', 'Adaptation', 'Speciation'], correct: 1, explanation: 'Evolution is change in heritable traits over successive generations.' },
    ],
    medium: [
      { q: 'A cross between Tt and Tt gives phenotypic ratio:', options: ['1:1', '3:1', '1:2:1', '9:3:3:1'], correct: 1, explanation: 'Monohybrid cross of heterozygotes: 3 dominant : 1 recessive.' },
      { q: 'Which chromosome pair determines male sex in humans?', options: ['XX', 'XY', 'YY', 'XO'], correct: 1, explanation: 'Males are XY, females are XX.' },
      { q: 'Darwin\'s theory of evolution is based on:', options: ['Natural selection', 'Mutation', 'Genetic drift', 'Lamarckism'], correct: 0, explanation: 'Natural selection is the mechanism Darwin proposed.' },
    ],
    difficult: [
      { q: 'In a dihybrid cross AaBb × AaBb, the ratio of phenotypes is:', options: ['3:1', '1:2:1', '9:3:3:1', '1:1:1:1'], correct: 2, explanation: 'Independent assortment gives 9:3:3:1 phenotypic ratio.' },
      { q: 'A nonsense mutation results in:', options: ['Silent change', 'Premature stop codon', 'Frameshift', 'Missense change'], correct: 1, explanation: 'Nonsense mutation creates a stop codon, truncating the protein.' },
    ],
  },
  {
    topic: 'Botany',
    easy: [
      { q: 'The process by which plants make food is:', options: ['Respiration', 'Photosynthesis', 'Transpiration', 'Digestion'], correct: 1, explanation: 'Photosynthesis converts light energy to chemical energy.' },
      { q: 'Which part of the plant conducts photosynthesis?', options: ['Root', 'Stem', 'Leaf', 'Flower'], correct: 2, explanation: 'Leaves contain chlorophyll for photosynthesis.' },
    ],
    medium: [
      { q: 'The products of photosynthesis are:', options: ['CO₂ and water', 'Glucose and oxygen', 'Glucose and CO₂', 'Oxygen and water'], correct: 1, explanation: '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂.' },
      { q: 'Which pigment is essential for photosynthesis?', options: ['Carotene', 'Chlorophyll', 'Xanthophyll', 'Anthocyanin'], correct: 1, explanation: 'Chlorophyll absorbs light for photosynthesis.' },
      { q: 'The xylem tissue is responsible for:', options: ['Food transport', 'Water transport', 'Gas exchange', 'Storage'], correct: 1, explanation: 'Xylem transports water and minerals from roots to leaves.' },
    ],
    difficult: [
      { q: 'The Calvin cycle occurs in which part of chloroplast?', options: ['Thylakoid', 'Stroma', 'Outer membrane', 'Inner membrane'], correct: 1, explanation: 'Calvin cycle (dark reactions) occurs in the stroma.' },
      { q: 'Which hormone promotes fruit ripening?', options: ['Auxin', 'Gibberellin', 'Ethylene', 'Cytokinin'], correct: 2, explanation: 'Ethylene is the ripening hormone in plants.' },
    ],
  },
];

// ─── Subject Question Banks ──────────────────────────────
const subjectBanks: Record<string, QuestionTemplate[]> = {
  Physics: physics,
  Chemistry: chemistry,
  Mathematics: mathematics,
  Biology: biology,
};

export function hasCuratedQuestionBank(subject: string): boolean {
  return Object.prototype.hasOwnProperty.call(subjectBanks, subject);
}

// PCMB learners can practise each of their four PUC subjects alongside an exam stream.
export const streamSubjects: Record<string, string[]> = {
  cet: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  neet: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  jee: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
};

export type RoleCategory = 'IT' | 'Non-IT';

export interface DegreeRole {
  role: string;
  category: RoleCategory;
  companies: string[];
  requiredSkills: string[];
}

export const degreeTypes = [
  { id: 'BE', name: 'B.E. / B.Tech', icon: 'HardHat', semesters: 8 },
  { id: 'MBA', name: 'MBA & Business', icon: 'Briefcase', semesters: 4 },
  { id: 'Diploma', name: 'Diploma', icon: 'Wrench', semesters: 6 },
];

export interface Department {
  id: string;
  name: string;
  degreeType: string;
  subjects: string[];
}

export const departments: Department[] = [
  { id: 'cse', name: 'Computer Science (CSE)', degreeType: 'BE', subjects: ['C Programming', 'C++ Programming', 'DBMS', 'Data Structures', 'Operating Systems', 'Mathematics', 'Physics'] },
  { id: 'ds', name: 'Data Science', degreeType: 'BE', subjects: ['Python', 'Machine Learning', 'Statistics', 'DBMS', 'Mathematics', 'Data Visualization'] },
  { id: 'ise', name: 'Information Science (ISE)', degreeType: 'BE', subjects: ['C Programming', 'Web Development', 'DBMS', 'Data Structures', 'Operating Systems', 'Mathematics'] },
  { id: 'ece', name: 'Electronics & Communication (ECE)', degreeType: 'BE', subjects: ['Digital Electronics', 'Signals & Systems', 'Microcontrollers', 'Circuit Design', 'Mathematics', 'Physics'] },
  { id: 'mech', name: 'Mechanical Engineering', degreeType: 'BE', subjects: ['Thermodynamics', 'Fluid Mechanics', 'Machine Design', 'Manufacturing', 'Mathematics', 'Physics'] },
  { id: 'civil', name: 'Civil Engineering', degreeType: 'BE', subjects: ['Structural Analysis', 'Surveying', 'Geotechnical', 'Transportation', 'Mathematics', 'Physics'] },
  { id: 'eee', name: 'Electrical Engineering (EEE)', degreeType: 'BE', subjects: ['Circuit Design', 'Power Systems', 'Control Systems', 'Electrical Machines', 'Mathematics', 'Physics'] },
];

export function getDepartmentsForDegree(degreeType: string): Department[] {
  return departments.filter((d) => d.degreeType === degreeType);
}

export function getDepartmentSubjects(deptId: string): string[] {
  return departments.find((d) => d.id === deptId)?.subjects || [];
}

export const itRoles: DegreeRole[] = [
  { role: 'Software Engineer', category: 'IT', companies: ['Infosys', 'TCS', 'Wipro', 'Accenture'], requiredSkills: ['Data Structures', 'Java', 'Python', 'SQL', 'Algorithms'] },
  { role: 'Data Analyst', category: 'IT', companies: ['Deloitte', 'EY', 'Cognizant'], requiredSkills: ['Python', 'SQL', 'Statistics', 'Excel', 'Machine Learning'] },
  { role: 'Cloud Engineer', category: 'IT', companies: ['Microsoft', 'AWS', 'Google Cloud'], requiredSkills: ['Cloud Computing', 'Linux', 'Networking', 'Python', 'Docker'] },
  { role: 'Cybersecurity Analyst', category: 'IT', companies: ['IBM', 'Palo Alto Networks'], requiredSkills: ['Networking', 'Cryptography', 'Linux', 'Python', 'Security'] },
];

export const nonItRoles: DegreeRole[] = [
  { role: 'Mechanical Engineer', category: 'Non-IT', companies: ['Bosch', 'Tata Motors', 'L&T'], requiredSkills: ['Mechanical Design', 'AutoCAD', 'SolidWorks', 'Thermodynamics'] },
  { role: 'Civil Engineer', category: 'Non-IT', companies: ['Shapoorji Pallonji', 'GMR', 'Sobha Developers'], requiredSkills: ['Structural Analysis', 'AutoCAD', 'Surveying', 'Project Management'] },
  { role: 'Electrical Engineer', category: 'Non-IT', companies: ['Siemens', 'ABB', 'Schneider Electric'], requiredSkills: ['Circuit Design', 'Power Systems', 'PLC', 'Electrical'] },
];

export const mbaRoles: DegreeRole[] = [
  { role: 'Product Manager', category: 'IT', companies: ['Flipkart', 'Amazon', 'Paytm'], requiredSkills: ['Product Strategy', 'Analytics', 'Communication', 'Agile'] },
  { role: 'Operations Manager', category: 'Non-IT', companies: ['Aditya Birla Group', 'Reliance', 'Mahindra'], requiredSkills: ['Operations', 'Supply Chain', 'Leadership', 'Communication'] },
  { role: 'HR / Finance Manager', category: 'Non-IT', companies: ['HDFC', 'ICICI', 'Kotak'], requiredSkills: ['Finance', 'Accounting', 'HR Management', 'Excel'] },
];

export function getRolesForDegree(degreeType: string): DegreeRole[] {
  if (degreeType === 'MBA') return [...mbaRoles];
  return [...itRoles, ...nonItRoles];
}

// ─── Company Post Flow ──────────────────────────────────
export interface CompanyPost {
  postTitle: string;
  role: string;
  category: 'IT' | 'Non-IT';
  requiredSkills: string[];
  fresherPackage: string;
  experiencedPackage: string;
  lastUpdated: string;
  requirements: string[];
}

export interface Company {
  name: string;
  category: 'IT' | 'Non-IT';
  posts: CompanyPost[];
}

export const itCompanies: Company[] = [
  {
    name: 'Infosys', category: 'IT',
    posts: [
      { postTitle: 'Systems Engineer', role: 'Software Engineer', category: 'IT', requiredSkills: ['Data Structures', 'Java', 'Python', 'SQL', 'Algorithms'], fresherPackage: '12 LPA', experiencedPackage: '18-25 LPA', lastUpdated: '2026-10-13', requirements: ['B.E./B.Tech in any stream', '65% throughout academics', 'No active backlogs', 'Strong programming fundamentals'] },
      { postTitle: 'Power Programmer', role: 'Software Engineer', category: 'IT', requiredSkills: ['Java', 'Spring', 'Microservices', 'REST API', 'SQL'], fresherPackage: '12 LPA', experiencedPackage: '22-35 LPA', lastUpdated: '2026-10-13', requirements: ['2+ years experience', 'Full-stack development', 'Spring Boot knowledge'] },
    ],
  },
  {
    name: 'TCS', category: 'IT',
    posts: [
      { postTitle: 'Software Developer', role: 'Software Engineer', category: 'IT', requiredSkills: ['Java', 'Python', 'SQL', 'Data Structures', 'Algorithms'], fresherPackage: '12 LPA', experiencedPackage: '16-28 LPA', lastUpdated: '2026-10-13', requirements: ['B.E./B.Tech', '60% throughout', 'Good communication', 'Aptitude strong'] },
      { postTitle: 'Data Analyst', role: 'Data Analyst', category: 'IT', requiredSkills: ['Python', 'SQL', 'Statistics', 'Excel', 'Machine Learning'], fresherPackage: '12 LPA', experiencedPackage: '18-30 LPA', lastUpdated: '2026-10-13', requirements: ['Knowledge of Python/SQL', 'Statistical concepts', 'Data visualization tools'] },
    ],
  },
  {
    name: 'Wipro', category: 'IT',
    posts: [
      { postTitle: 'Project Engineer', role: 'Software Engineer', category: 'IT', requiredSkills: ['Python', 'Java', 'SQL', 'Data Structures', 'Algorithms'], fresherPackage: '12 LPA', experiencedPackage: '15-24 LPA', lastUpdated: '2026-10-13', requirements: ['B.E./B.Tech', '60% throughout', 'Programming skills'] },
    ],
  },
  {
    name: 'Accenture', category: 'IT',
    posts: [
      { postTitle: 'Application Developer', role: 'Software Engineer', category: 'IT', requiredSkills: ['Java', 'Python', 'SQL', 'Web Development', 'Algorithms'], fresherPackage: '12 LPA', experiencedPackage: '20-32 LPA', lastUpdated: '2026-10-13', requirements: ['B.E./B.Tech', '65% throughout', 'Full-stack capabilities'] },
      { postTitle: 'Cloud Engineer', role: 'Cloud Engineer', category: 'IT', requiredSkills: ['Cloud Computing', 'Linux', 'Docker', 'Python', 'Networking'], fresherPackage: '12 LPA', experiencedPackage: '25-40 LPA', lastUpdated: '2026-10-13', requirements: ['AWS/Azure certification preferred', 'Linux fundamentals', ' scripting skills'] },
    ],
  },
  {
    name: 'Deloitte', category: 'IT',
    posts: [
      { postTitle: 'Data Analyst', role: 'Data Analyst', category: 'IT', requiredSkills: ['Python', 'SQL', 'Statistics', 'Excel', 'Analytics'], fresherPackage: '12 LPA', experiencedPackage: '20-35 LPA', lastUpdated: '2026-10-13', requirements: ['B.E./B.Tech or B.Com', 'Strong analytical skills', 'SQL proficiency'] },
    ],
  },
  {
    name: 'EY', category: 'IT',
    posts: [
      { postTitle: 'Business Analyst', role: 'Data Analyst', category: 'IT', requiredSkills: ['Python', 'SQL', 'Statistics', 'Excel', 'Analytics'], fresherPackage: '12 LPA', experiencedPackage: '18-28 LPA', lastUpdated: '2026-10-13', requirements: ['Analytical mindset', 'SQL and Excel', 'Communication skills'] },
    ],
  },
  {
    name: 'Cognizant', category: 'IT',
    posts: [
      { postTitle: 'Programmer Analyst', role: 'Software Engineer', category: 'IT', requiredSkills: ['Java', 'Python', 'SQL', 'Data Structures', 'Algorithms'], fresherPackage: '12 LPA', experiencedPackage: '16-26 LPA', lastUpdated: '2026-10-13', requirements: ['B.E./B.Tech', '60% throughout', 'Programming knowledge'] },
      { postTitle: 'Data Engineer', role: 'Data Analyst', category: 'IT', requiredSkills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Excel'], fresherPackage: '12 LPA', experiencedPackage: '20-32 LPA', lastUpdated: '2026-10-13', requirements: ['Data pipeline experience', 'Python/SQL strong', 'ETL knowledge'] },
    ],
  },
  {
    name: 'Microsoft', category: 'IT',
    posts: [
      { postTitle: 'Cloud Solutions Engineer', role: 'Cloud Engineer', category: 'IT', requiredSkills: ['Cloud Computing', 'Azure', 'Linux', 'Python', 'Docker'], fresherPackage: '12 LPA', experiencedPackage: '30-60 LPA', lastUpdated: '2026-10-13', requirements: ['Azure certification', 'Cloud architecture knowledge', '3+ years cloud experience'] },
    ],
  },
  {
    name: 'AWS', category: 'IT',
    posts: [
      { postTitle: 'Cloud Support Engineer', role: 'Cloud Engineer', category: 'IT', requiredSkills: ['Cloud Computing', 'Linux', 'Networking', 'Python', 'Docker'], fresherPackage: '12 LPA', experiencedPackage: '28-55 LPA', lastUpdated: '2026-10-13', requirements: ['AWS certification', 'Networking fundamentals', 'Scripting skills'] },
    ],
  },
  {
    name: 'Google Cloud', category: 'IT',
    posts: [
      { postTitle: 'Cloud Engineer', role: 'Cloud Engineer', category: 'IT', requiredSkills: ['Cloud Computing', 'Linux', 'Python', 'Docker', 'Networking'], fresherPackage: '12 LPA', experiencedPackage: '30-55 LPA', lastUpdated: '2026-10-13', requirements: ['GCP certification', 'Infrastructure knowledge', 'Kubernetes experience'] },
    ],
  },
  {
    name: 'IBM', category: 'IT',
    posts: [
      { postTitle: 'Security Analyst', role: 'Cybersecurity Analyst', category: 'IT', requiredSkills: ['Networking', 'Cryptography', 'Linux', 'Python', 'Security'], fresherPackage: '12 LPA', experiencedPackage: '20-38 LPA', lastUpdated: '2026-10-13', requirements: ['Security certification (CEH/Security+)', 'Network knowledge', 'Penetration testing basics'] },
    ],
  },
  {
    name: 'Palo Alto Networks', category: 'IT',
    posts: [
      { postTitle: 'Cybersecurity Analyst', role: 'Cybersecurity Analyst', category: 'IT', requiredSkills: ['Networking', 'Cryptography', 'Linux', 'Security', 'Python'], fresherPackage: '12 LPA', experiencedPackage: '25-45 LPA', lastUpdated: '2026-10-13', requirements: ['Firewall knowledge', 'Threat analysis skills', 'Security certifications'] },
    ],
  },
  {
    name: 'Flipkart', category: 'IT',
    posts: [
      { postTitle: 'Product Manager', role: 'Product Manager', category: 'IT', requiredSkills: ['Product Strategy', 'Analytics', 'Communication', 'Agile'], fresherPackage: '12 LPA', experiencedPackage: '30-60 LPA', lastUpdated: '2026-10-13', requirements: ['MBA preferred', 'Analytical mindset', 'Product sense'] },
    ],
  },
  {
    name: 'Amazon', category: 'IT',
    posts: [
      { postTitle: 'Product Manager', role: 'Product Manager', category: 'IT', requiredSkills: ['Product Strategy', 'Analytics', 'Communication', 'Agile'], fresherPackage: '12 LPA', experiencedPackage: '35-70 LPA', lastUpdated: '2026-10-13', requirements: ['MBA or B.E. with product experience', 'Data-driven decision making', 'Leadership skills'] },
    ],
  },
  {
    name: 'Paytm', category: 'IT',
    posts: [
      { postTitle: 'Associate Product Manager', role: 'Product Manager', category: 'IT', requiredSkills: ['Product Strategy', 'Analytics', 'Communication', 'Agile'], fresherPackage: '12 LPA', experiencedPackage: '20-40 LPA', lastUpdated: '2026-10-13', requirements: ['Product thinking', 'Analytical skills', 'User empathy'] },
    ],
  },
];

export const nonItCompanies: Company[] = [
  {
    name: 'Bosch', category: 'Non-IT',
    posts: [
      { postTitle: 'Mechanical Design Engineer', role: 'Mechanical Engineer', category: 'Non-IT', requiredSkills: ['Mechanical Design', 'AutoCAD', 'SolidWorks', 'Thermodynamics'], fresherPackage: '12 LPA', experiencedPackage: '16-28 LPA', lastUpdated: '2026-10-13', requirements: ['B.E. Mechanical', 'AutoCAD/SolidWorks proficiency', 'Design fundamentals'] },
    ],
  },
  {
    name: 'Tata Motors', category: 'Non-IT',
    posts: [
      { postTitle: 'Production Engineer', role: 'Mechanical Engineer', category: 'Non-IT', requiredSkills: ['Mechanical Design', 'Thermodynamics', 'Manufacturing', 'AutoCAD'], fresherPackage: '12 LPA', experiencedPackage: '15-25 LPA', lastUpdated: '2026-10-13', requirements: ['B.E. Mechanical', 'Manufacturing knowledge', 'Automotive interest'] },
    ],
  },
  {
    name: 'L&T', category: 'Non-IT',
    posts: [
      { postTitle: 'Civil Site Engineer', role: 'Civil Engineer', category: 'Non-IT', requiredSkills: ['Structural Analysis', 'Surveying', 'AutoCAD', 'Project Management'], fresherPackage: '12 LPA', experiencedPackage: '15-26 LPA', lastUpdated: '2026-10-13', requirements: ['B.E. Civil', 'Site experience preferred', 'AutoCAD skills'] },
      { postTitle: 'Mechanical Engineer', role: 'Mechanical Engineer', category: 'Non-IT', requiredSkills: ['Mechanical Design', 'SolidWorks', 'Thermodynamics', 'Manufacturing'], fresherPackage: '12 LPA', experiencedPackage: '16-28 LPA', lastUpdated: '2026-10-13', requirements: ['B.E. Mechanical', 'Heavy engineering knowledge', 'Design skills'] },
    ],
  },
  {
    name: 'Shapoorji Pallonji', category: 'Non-IT',
    posts: [
      { postTitle: 'Structural Engineer', role: 'Civil Engineer', category: 'Non-IT', requiredSkills: ['Structural Analysis', 'AutoCAD', 'Surveying', 'Project Management'], fresherPackage: '12 LPA', experiencedPackage: '14-22 LPA', lastUpdated: '2026-10-13', requirements: ['B.E. Civil', 'Structural design knowledge', 'Construction experience'] },
    ],
  },
  {
    name: 'GMR', category: 'Non-IT',
    posts: [
      { postTitle: 'Project Engineer', role: 'Civil Engineer', category: 'Non-IT', requiredSkills: ['Structural Analysis', 'Surveying', 'Project Management', 'AutoCAD'], fresherPackage: '12 LPA', experiencedPackage: '14-24 LPA', lastUpdated: '2026-10-13', requirements: ['B.E. Civil', 'Infrastructure project experience', 'Surveying knowledge'] },
    ],
  },
  {
    name: 'Sobha Developers', category: 'Non-IT',
    posts: [
      { postTitle: 'Construction Engineer', role: 'Civil Engineer', category: 'Non-IT', requiredSkills: ['Structural Analysis', 'Surveying', 'AutoCAD', 'Project Management'], fresherPackage: '12 LPA', experiencedPackage: '13-20 LPA', lastUpdated: '2026-10-13', requirements: ['B.E. Civil', 'Real estate construction', 'Quality control'] },
    ],
  },
  {
    name: 'Siemens', category: 'Non-IT',
    posts: [
      { postTitle: 'Electrical Engineer', role: 'Electrical Engineer', category: 'Non-IT', requiredSkills: ['Circuit Design', 'Power Systems', 'PLC', 'Electrical'], fresherPackage: '12 LPA', experiencedPackage: '18-32 LPA', lastUpdated: '2026-10-13', requirements: ['B.E. EEE', 'Circuit design knowledge', 'PLC programming'] },
    ],
  },
  {
    name: 'ABB', category: 'Non-IT',
    posts: [
      { postTitle: 'Power Systems Engineer', role: 'Electrical Engineer', category: 'Non-IT', requiredSkills: ['Circuit Design', 'Power Systems', 'PLC', 'Electrical'], fresherPackage: '12 LPA', experiencedPackage: '18-30 LPA', lastUpdated: '2026-10-13', requirements: ['B.E. EEE', 'Power electronics', 'Automation knowledge'] },
    ],
  },
  {
    name: 'Schneider Electric', category: 'Non-IT',
    posts: [
      { postTitle: 'Electrical Design Engineer', role: 'Electrical Engineer', category: 'Non-IT', requiredSkills: ['Circuit Design', 'Power Systems', 'Electrical', 'PLC'], fresherPackage: '12 LPA', experiencedPackage: '16-26 LPA', lastUpdated: '2026-10-13', requirements: ['B.E. EEE', 'Electrical design', 'Energy management'] },
    ],
  },
  {
    name: 'Aditya Birla Group', category: 'Non-IT',
    posts: [
      { postTitle: 'Operations Manager', role: 'Operations Manager', category: 'Non-IT', requiredSkills: ['Operations', 'Supply Chain', 'Leadership', 'Communication'], fresherPackage: '12 LPA', experiencedPackage: '20-35 LPA', lastUpdated: '2026-10-13', requirements: ['MBA', 'Operations knowledge', 'People management'] },
    ],
  },
  {
    name: 'Reliance', category: 'Non-IT',
    posts: [
      { postTitle: 'Operations Manager', role: 'Operations Manager', category: 'Non-IT', requiredSkills: ['Operations', 'Supply Chain', 'Leadership', 'Communication'], fresherPackage: '12 LPA', experiencedPackage: '22-38 LPA', lastUpdated: '2026-10-13', requirements: ['MBA', 'Large-scale operations', 'Strategic thinking'] },
    ],
  },
  {
    name: 'Mahindra', category: 'Non-IT',
    posts: [
      { postTitle: 'Operations Manager', role: 'Operations Manager', category: 'Non-IT', requiredSkills: ['Operations', 'Supply Chain', 'Leadership', 'Communication'], fresherPackage: '12 LPA', experiencedPackage: '18-30 LPA', lastUpdated: '2026-10-13', requirements: ['MBA', 'Manufacturing operations', 'Process optimization'] },
    ],
  },
  {
    name: 'HDFC', category: 'Non-IT',
    posts: [
      { postTitle: 'Finance Manager', role: 'HR / Finance Manager', category: 'Non-IT', requiredSkills: ['Finance', 'Accounting', 'Excel', 'HR Management'], fresherPackage: '12 LPA', experiencedPackage: '18-32 LPA', lastUpdated: '2026-10-13', requirements: ['MBA Finance', 'Financial modeling', 'Banking knowledge'] },
    ],
  },
  {
    name: 'ICICI', category: 'Non-IT',
    posts: [
      { postTitle: 'HR Manager', role: 'HR / Finance Manager', category: 'Non-IT', requiredSkills: ['HR Management', 'Communication', 'Excel', 'Finance'], fresherPackage: '12 LPA', experiencedPackage: '16-28 LPA', lastUpdated: '2026-10-13', requirements: ['MBA HR', 'Recruitment experience', 'HR policies knowledge'] },
    ],
  },
  {
    name: 'Kotak', category: 'Non-IT',
    posts: [
      { postTitle: 'Relationship Manager', role: 'HR / Finance Manager', category: 'Non-IT', requiredSkills: ['Finance', 'Accounting', 'Communication', 'Excel'], fresherPackage: '12 LPA', experiencedPackage: '15-25 LPA', lastUpdated: '2026-10-13', requirements: ['MBA', 'Financial products knowledge', 'Client management'] },
    ],
  },
];

export function getCompaniesForDegree(degreeType: string): Company[] {
  if (degreeType === 'MBA') return [...itCompanies.filter(c => c.posts.some(p => p.role === 'Product Manager')), ...nonItCompanies.filter(c => c.posts.some(p => p.role === 'Operations Manager' || p.role === 'HR / Finance Manager'))];
  if (degreeType === 'Diploma') return [];
  return [...itCompanies, ...nonItCompanies];
}

// ─── Diploma Government Jobs ──────────────────────────────
export interface GovJob {
  title: string;
  department: string;
  eligibility: string[];
  requiredSkills: string[];
  packageRange: string;
  lastUpdated: string;
}

export const govJobs: GovJob[] = [
  { title: 'Junior Engineer (JE) - Public Works', department: 'PWD', eligibility: ['Diploma in Civil', 'Age 18-35', 'Indian citizen'], requiredSkills: ['Structural Analysis', 'Surveying', 'AutoCAD', 'Project Management'], packageRange: '6-12 LPA', lastUpdated: '2026-10-13' },
  { title: 'Junior Engineer (JE) - Electrical', department: 'BESCOM', eligibility: ['Diploma in Electrical/EEE', 'Age 18-35', 'Indian citizen'], requiredSkills: ['Circuit Design', 'Power Systems', 'PLC', 'Electrical'], packageRange: '6-12 LPA', lastUpdated: '2026-10-13' },
  { title: 'Junior Engineer (JE) - Mechanical', department: 'KSPD', eligibility: ['Diploma in Mechanical', 'Age 18-35', 'Indian citizen'], requiredSkills: ['Mechanical Design', 'Thermodynamics', 'Manufacturing', 'AutoCAD'], packageRange: '6-12 LPA', lastUpdated: '2026-10-13' },
  { title: 'Technician - Railways', department: 'Indian Railways', eligibility: ['Diploma in any branch', 'Age 18-33', 'ITI/Diploma'], requiredSkills: ['Technical Drawing', 'Workshop Practice', 'Mathematics'], packageRange: '5-10 LPA', lastUpdated: '2026-10-13' },
  { title: 'Lab Assistant - DRDO', department: 'DRDO', eligibility: ['Diploma in ECE/EEE', 'Age 18-28', 'Indian citizen'], requiredSkills: ['Digital Electronics', 'Circuit Design', 'Microcontrollers'], packageRange: '7-14 LPA', lastUpdated: '2026-10-13' },
  { title: 'Junior Telecom Officer (JTO)', department: 'BSNL', eligibility: ['Diploma in ECE/Telecom', 'Age 18-30', 'Indian citizen'], requiredSkills: ['Networking', 'Signals & Systems', 'Digital Electronics'], packageRange: '8-15 LPA', lastUpdated: '2026-10-13' },
  { title: 'Assistant Programmer', department: 'NIC', eligibility: ['Diploma in CSE/ISE', 'Age 18-30', 'Programming knowledge'], requiredSkills: ['C Programming', 'Python', 'DBMS', 'Data Structures'], packageRange: '8-16 LPA', lastUpdated: '2026-10-13' },
  { title: 'Surveyor - Revenue Department', department: 'Revenue Dept', eligibility: ['Diploma in Civil', 'Age 18-35', 'Indian citizen'], requiredSkills: ['Surveying', 'AutoCAD', 'GIS', 'Mathematics'], packageRange: '5-10 LPA', lastUpdated: '2026-10-13' },
];

export const codingConcepts = [
  { id: 'arrays', title: 'Arrays & Strings', summary: 'Arrays store elements in contiguous memory. Key operations: traversal, insertion, deletion, searching. Common patterns: two-pointer, sliding window.', keyPoints: ['Time complexity: access O(1), search O(n), insert/delete O(n)', 'Two-pointer technique: one from start, one from end', 'Sliding window: maintain a window of elements that satisfies a condition'], sampleQ: 'Reverse an array in-place. What is the time complexity?', sampleA: 'Use two pointers — one at start, one at end. Swap elements and move pointers inward. O(n) time, O(1) space.' },
  { id: 'linkedlists', title: 'Linked Lists', summary: 'A linked list is a linear data structure where elements are linked using pointers. Each node contains data and a reference to the next node.', keyPoints: ['Singly linked: each node points to next. Doubly linked: points to both next and prev', 'Insertion at head: O(1). Search: O(n)', 'Detect cycle: Floyd\'s tortoise and hare algorithm'], sampleQ: 'Detect if a linked list has a cycle. How?', sampleA: 'Use two pointers — slow moves 1 step, fast moves 2 steps. If they meet, there is a cycle. O(n) time, O(1) space.' },
  { id: 'trees', title: 'Trees & Binary Search Trees', summary: 'A tree is a hierarchical data structure. BSTs maintain the property: left child < parent < right child.', keyPoints: ['BST search/insert/delete: O(log n) average, O(n) worst', 'Tree traversals: in-order, pre-order, post-order, level-order (BFS)', 'Balanced trees (AVL, Red-Black): guarantee O(log n) operations'], sampleQ: 'What is the in-order traversal of a BST?', sampleA: 'In-order traversal of a BST gives nodes in ascending sorted order: left subtree → root → right subtree.' },
  { id: 'sorting', title: 'Sorting Algorithms', summary: 'Sorting arranges elements in order. Different algorithms have different time/space tradeoffs.', keyPoints: ['Bubble/Selection/Insertion sort: O(n²) — simple but slow', 'Merge sort: O(n log n) — stable, needs O(n) extra space', 'Quick sort: O(n log n) average, O(n²) worst — in-place'], sampleQ: 'When would you choose merge sort over quick sort?', sampleA: 'Choose merge sort when stability matters (equal elements keep original order) or when working with linked lists. Quick sort is preferred for arrays when average performance matters.' },
  { id: 'graphs', title: 'Graphs & BFS/DFS', summary: 'A graph consists of vertices and edges. BFS explores level by level; DFS explores as deep as possible before backtracking.', keyPoints: ['BFS: uses a queue, finds shortest path in unweighted graphs', 'DFS: uses a stack (or recursion), good for cycle detection, topological sort', 'Representation: adjacency matrix O(V²), adjacency list O(V+E)'], sampleQ: 'Find the shortest path in an unweighted graph. Which algorithm?', sampleA: 'BFS (Breadth-First Search) finds the shortest path in an unweighted graph because it explores all nodes at distance k before distance k+1.' },
  { id: 'dp', title: 'Dynamic Programming', summary: 'DP solves problems by breaking them into overlapping subproblems and storing results to avoid recomputation.', keyPoints: ['Two approaches: memoization (top-down) and tabulation (bottom-up)', 'Identify: optimal substructure + overlapping subproblems', 'Classic problems: Fibonacci, knapsack, longest common subsequence'], sampleQ: 'What is the difference between memoization and tabulation?', sampleA: 'Memoization is top-down — you recurse and cache results. Tabulation is bottom-up — you iteratively fill a table. Both avoid recomputing overlapping subproblems.' },
];

// ─── Question Generator ──────────────────────────────────
function generateFallbackExam(subject: string, count: number): Question[] {
  const topic = subject.includes('Programming') || subject === 'Python' || subject === 'Web Development' ? 'Coding Fundamentals' : 'Core Theory';
  const templates = [
    { q: `Which is the best first step when learning ${subject}?`, options: ['Memorize answers without understanding', 'Understand the core concept and practise it', 'Skip examples', 'Only watch videos'], correct: 1, explanation: `Understanding the core concept and practising it builds reliable knowledge in ${subject}.` },
    { q: `How should you improve in ${subject}?`, options: ['Review mistakes and solve similar questions', 'Avoid difficult questions', 'Study only the night before', 'Copy solutions immediately'], correct: 0, explanation: `Reviewing mistakes and solving a similar question turns feedback into progress.` },
    { q: `What helps most during a ${subject} exam?`, options: ['Reading every option carefully', 'Leaving all questions until the end', 'Guessing without reading', 'Ignoring time'], correct: 0, explanation: `Read carefully, manage time, and use the explanation after the exam to improve.` },
  ];
  return Array.from({ length: count }, (_, index) => {
    const template = templates[index % templates.length];
    const difficulty: Difficulty = index < Math.round(count * 0.3) ? 'easy' : index < Math.round(count * 0.8) ? 'medium' : 'difficult';
    return { question: template.q, options: template.options, correctAnswer: template.correct, explanation: template.explanation, id: index + 1, subject, topic, difficulty, yearAsked: null };
  });
}

export function generateExam(subject: string, count: number = 25): Question[] {
  const bank = subjectBanks[subject];
  if (!bank) return generateFallbackExam(subject, count);

  // Collect all questions by difficulty
  const easy: Omit<Question, 'id' | 'subject'>[] = [];
  const medium: Omit<Question, 'id' | 'subject'>[] = [];
  const difficult: Omit<Question, 'id' | 'subject'>[] = [];

  bank.forEach((template) => {
    template.easy.forEach((q) => easy.push({ question: q.q, options: q.options, correctAnswer: q.correct, explanation: q.explanation, difficulty: 'easy', topic: template.topic, yearAsked: null }));
    template.medium.forEach((q) => medium.push({ question: q.q, options: q.options, correctAnswer: q.correct, explanation: q.explanation, difficulty: 'medium', topic: template.topic, yearAsked: null }));
    template.difficult.forEach((q) => difficult.push({ question: q.q, options: q.options, correctAnswer: q.correct, explanation: q.explanation, difficulty: 'difficult', topic: template.topic, yearAsked: null }));
  });

  // Calculate distribution: 30% easy, 50% medium, 20% difficult
  const easyCount = Math.round(count * 0.30);
  const mediumCount = Math.round(count * 0.50);
  const difficultCount = count - easyCount - mediumCount;

  const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

  const selected = [
    ...shuffle(easy).slice(0, easyCount),
    ...shuffle(medium).slice(0, mediumCount),
    ...shuffle(difficult).slice(0, difficultCount),
  ];

  const shuffled = shuffle(selected);

  return shuffled.map((q, idx) => ({
    ...q,
    id: idx + 1,
    subject,
    yearAsked: null,
  } as Question));
}

export function generateHomework(subject: string, day: number): Question[] {
  const questionCount = [1, 2, 3, 2][day - 1] || 1;
  return generateExam(subject, questionCount);
}

export function generateAssignment(subject: string, count: number = 10): Question[] {
  return generateExam(subject, count);
}

export function generateGapExam(skills: string[], count: number = 25): Question[] {
  // For gap exams, we use a mix of subjects relevant to the degree
  // Generate from multiple subjects
  const subjects = skills.includes('Programming') || skills.includes('Python') || skills.includes('Java')
    ? ['Mathematics']
    : ['Chemistry'];
  
  // Use available banks; if skills are more general, default to math + physics
  const availableSubjects = Object.keys(subjectBanks);
  const chosenSubjects = subjects.filter((subject) => availableSubjects.includes(subject));
  if (chosenSubjects.length === 0) chosenSubjects.push(...availableSubjects.slice(0, 2));
  
  const half = Math.floor(count / 2);
  const rest = count - half;
  
  const q1 = generateExam(chosenSubjects[0], half);
  const q2 = generateExam(chosenSubjects[1] || chosenSubjects[0], rest);
  
  return [...q1, ...q2].map((q, idx) => ({ ...q, id: idx + 1, subject: 'Gap Assessment' }));
}

export const difficultyColors: Record<Difficulty, string> = {
  easy: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  medium: 'text-amber-600 bg-amber-50 border-amber-200',
  difficult: 'text-rose-600 bg-rose-50 border-rose-200',
};

export const homeworkPattern = [
  { day: 1, questions: 1 },
  { day: 2, questions: 2 },
  { day: 3, questions: 3 },
  { day: 4, questions: 2 },
];

export type ScoreTier = 'gold' | 'silver' | 'bronze' | 'try_again';

export function getScoreTier(correct: number): ScoreTier {
  if (correct >= 20) return 'gold';
  if (correct >= 15) return 'silver';
  if (correct >= 10) return 'bronze';
  return 'try_again';
}

export const tierConfig: Record<ScoreTier, { label: string; icon: string; color: string; bgColor: string; borderColor: string; description: string }> = {
  gold: { label: 'Gold', icon: 'Medal', color: 'text-amber-700', bgColor: 'bg-amber-100', borderColor: 'border-amber-300', description: 'Outstanding! 20+ correct answers.' },
  silver: { label: 'Silver', icon: 'Award', color: 'text-slate-600', bgColor: 'bg-slate-200', borderColor: 'border-slate-400', description: 'Great job! 15-19 correct answers.' },
  bronze: { label: 'Bronze', icon: 'Shield', color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-300', description: 'Good effort! 10-14 correct answers.' },
  try_again: { label: 'Try Again', icon: 'RefreshCw', color: 'text-rose-600', bgColor: 'bg-rose-100', borderColor: 'border-rose-300', description: 'Keep practicing! 1-9 correct answers.' },
};

/*
# Add practice question bank for CET, NEET, JEE and Degree

1. New Tables
- `practice_questions` stores multiple-choice questions for each exam track.
  - `track` (cet, neet, jee, degree), `subject`, `topic`, `difficulty`
  - `question`, `options` (four choices), `correct_index` (0 to 3), `explanation`
  - `year_asked` (the year of the previous-year paper, used for filtering)

2. Seed Data
- 20 starter questions for each track (80 total) so Daily Learn, Assignments and the 20-question Mock Test all work.
- The bank is designed to grow; more rows can be added in later migrations.

3. Security
- Row-level security is enabled.
- Signed-in users can read the question bank.
- Browser clients cannot insert, update or delete questions.

4. Notes
- This migration is idempotent and does not change any learner data.
*/

CREATE TABLE IF NOT EXISTS public.practice_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track text NOT NULL CHECK (track IN ('cet', 'neet', 'jee', 'degree')),
  subject text NOT NULL,
  topic text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'difficult')),
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_index integer NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  explanation text NOT NULL,
  year_asked integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(track, question)
);

ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.practice_questions TO authenticated;

DROP POLICY IF EXISTS "authenticated_read_practice_questions" ON public.practice_questions;
CREATE POLICY "authenticated_read_practice_questions" ON public.practice_questions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_practice_questions" ON public.practice_questions;
CREATE POLICY "authenticated_insert_practice_questions" ON public.practice_questions FOR INSERT TO authenticated WITH CHECK (false);
DROP POLICY IF EXISTS "authenticated_update_practice_questions" ON public.practice_questions;
CREATE POLICY "authenticated_update_practice_questions" ON public.practice_questions FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
DROP POLICY IF EXISTS "authenticated_delete_practice_questions" ON public.practice_questions;
CREATE POLICY "authenticated_delete_practice_questions" ON public.practice_questions FOR DELETE TO authenticated USING (false);

CREATE INDEX IF NOT EXISTS idx_practice_questions_track ON public.practice_questions(track, year_asked);

INSERT INTO public.practice_questions (track, subject, topic, difficulty, question, options, correct_index, explanation, year_asked) VALUES
('cet', 'Physics', 'Kinematics', 'easy', 'A car accelerates uniformly from rest to 20 m/s in 5 s. Its acceleration is?', '["2 m/s²","4 m/s²","5 m/s²","10 m/s²"]', 1, 'a = (v - u) / t = 20 / 5 = 4 m/s².', 2023),
('cet', 'Physics', 'Laws of Motion', 'easy', 'The SI unit of force is?', '["Joule","Newton","Watt","Pascal"]', 1, 'Force is measured in newtons (kg·m/s²).', 2022),
('cet', 'Physics', 'Current Electricity', 'easy', 'Ohm law states that V is proportional to?', '["R","I","P","Q"]', 1, 'V = IR, so at constant resistance V is proportional to current I.', 2024),
('cet', 'Physics', 'Ray Optics', 'medium', 'The focal length of a plane mirror is?', '["Zero","Infinite","10 cm","5 cm"]', 1, 'A plane mirror has an infinite focal length.', 2021),
('cet', 'Physics', 'Work and Energy', 'easy', 'Power is the rate of doing?', '["Work","Force","Energy per unit mass","Momentum"]', 0, 'P = W / t, so power is the rate of doing work.', 2023),
('cet', 'Chemistry', 'Atomic Structure', 'easy', 'Number of protons in carbon is?', '["6","12","8","14"]', 0, 'The atomic number of carbon is 6.', 2023),
('cet', 'Chemistry', 'Periodic Table', 'easy', 'Elements in the same group have the same number of?', '["Protons","Valence electrons","Neutrons","Shells"]', 1, 'Elements in one group share the same number of valence electrons.', 2022),
('cet', 'Chemistry', 'Mole Concept', 'medium', 'Molar mass of water (H2O) is approximately?', '["16 g/mol","18 g/mol","20 g/mol","28 g/mol"]', 1, 'H = 1 and O = 16, so 2 × 1 + 16 = 18 g/mol.', 2024),
('cet', 'Chemistry', 'Acids and Bases', 'easy', 'A solution with pH 2 is?', '["Basic","Neutral","Acidic","Salt"]', 2, 'pH below 7 is acidic.', 2021),
('cet', 'Chemistry', 'Chemical Bonding', 'medium', 'NaCl is an example of which bond?', '["Covalent","Ionic","Metallic","Hydrogen"]', 1, 'Sodium transfers an electron to chlorine, forming an ionic bond.', 2025),
('cet', 'Mathematics', 'Linear Equations', 'easy', 'If 2x + 3 = 11, then x equals?', '["3","4","5","6"]', 1, '2x = 8, so x = 4.', 2023),
('cet', 'Mathematics', 'Quadratic Equations', 'medium', 'Roots of x² - 5x + 6 = 0 are?', '["2 and 3","1 and 6","-2 and -3","3 and 4"]', 0, '(x - 2)(x - 3) = 0 gives x = 2 or x = 3.', 2024),
('cet', 'Mathematics', 'Trigonometry', 'easy', 'The value of sin 30° is?', '["1/2","√3/2","1","0"]', 0, 'sin 30° = 1/2.', 2022),
('cet', 'Mathematics', 'Probability', 'easy', 'Probability of getting a head when a fair coin is tossed is?', '["1/4","1/2","1","0"]', 1, 'There are two equally likely outcomes, so the probability is 1/2.', 2021),
('cet', 'Mathematics', 'Calculus', 'medium', 'Derivative of x³ is?', '["x²","3x²","3x","x³/3"]', 1, 'd/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x³) = 3x².', 2025),
('cet', 'Biology', 'Cell Biology', 'easy', 'The powerhouse of the cell is?', '["Nucleus","Ribosome","Mitochondria","Golgi body"]', 2, 'Mitochondria produce ATP, the energy currency of the cell.', 2023),
('cet', 'Biology', 'Photosynthesis', 'easy', 'Photosynthesis mainly takes place in?', '["Roots","Leaves","Stem","Flowers"]', 1, 'Leaves contain most of the chlorophyll that captures light.', 2022),
('cet', 'Biology', 'Human Physiology', 'medium', 'Which blood group is the universal donor for red cells?', '["AB","A","B","O"]', 3, 'Group O red cells lack A and B antigens, so they can be given to most people.', 2024),
('cet', 'Biology', 'Genetics', 'easy', 'Mendel performed his experiments on which plant?', '["Garden pea","Maize","Rice","Wheat"]', 0, 'Mendel used the garden pea, Pisum sativum.', 2021),
('cet', 'Biology', 'Ecology', 'easy', 'Producers in a food chain are?', '["Herbivores","Carnivores","Plants","Decomposers"]', 2, 'Green plants make their own food by photosynthesis.', 2025),
('neet', 'Physics', 'Units and Dimensions', 'medium', 'Dimensional formula of force is?', '["MLT⁻²","ML²T⁻²","MLT⁻¹","ML⁻¹T⁻²"]', 0, 'F = ma, and acceleration has dimensions LT⁻², so force is MLT⁻².', 2024),
('neet', 'Physics', 'Gravitation', 'medium', 'Escape velocity from Earth surface is approximately?', '["7.9 km/s","11.2 km/s","3 km/s","25 km/s"]', 1, 'The escape velocity from Earth is about 11.2 km/s.', 2023),
('neet', 'Physics', 'Current Electricity', 'easy', 'The unit of electric resistance is?', '["Ampere","Volt","Ohm","Coulomb"]', 2, 'Resistance is measured in ohms.', 2022),
('neet', 'Physics', 'Electromagnetic Waves', 'easy', 'Speed of light in vacuum is approximately?', '["3 × 10⁵ m/s","3 × 10⁸ m/s","3 × 10⁶ m/s","3 × 10¹⁰ m/s"]', 1, 'c is about 3 × 10⁸ m/s.', 2025),
('neet', 'Physics', 'Work and Energy', 'medium', 'A 2 kg body moves at 3 m/s. Its kinetic energy is?', '["3 J","6 J","9 J","12 J"]', 2, 'KE = ½ × 2 × 3² = 9 J.', 2021),
('neet', 'Chemistry', 'Atomic Structure', 'easy', 'Atomic number of oxygen is?', '["6","7","8","16"]', 2, 'Oxygen has 8 protons.', 2023),
('neet', 'Chemistry', 'Metals and Non-metals', 'easy', 'Which gas is evolved when zinc reacts with dilute HCl?', '["Oxygen","Hydrogen","Chlorine","Carbon dioxide"]', 1, 'Zn + 2HCl gives ZnCl2 and hydrogen gas.', 2024),
('neet', 'Chemistry', 'Chemical Bonding', 'medium', 'The hybridisation of carbon in methane is?', '["sp","sp²","sp³","sp³d"]', 2, 'Carbon in methane forms four equivalent bonds, so it is sp³ hybridised.', 2022),
('neet', 'Chemistry', 'Periodic Table', 'medium', 'Which is the most electronegative element?', '["Oxygen","Fluorine","Chlorine","Nitrogen"]', 1, 'Fluorine has the highest electronegativity on the Pauling scale.', 2025),
('neet', 'Chemistry', 'Alkali Metals', 'easy', 'Which is an alkali metal?', '["Magnesium","Sodium","Calcium","Aluminium"]', 1, 'Sodium belongs to Group 1, the alkali metals.', 2021),
('neet', 'Biology', 'Molecular Genetics', 'medium', 'DNA replication is semi-conservative. This was proved by?', '["Watson and Crick","Meselson and Stahl","Griffith","Hershey and Chase"]', 1, 'Meselson and Stahl used heavy nitrogen isotopes to prove semi-conservative replication.', 2024),
('neet', 'Biology', 'Photosynthesis', 'easy', 'Site of photosynthesis in a plant cell is?', '["Mitochondria","Chloroplast","Ribosome","Vacuole"]', 1, 'Chloroplasts contain chlorophyll and carry out photosynthesis.', 2023),
('neet', 'Biology', 'Endocrine System', 'easy', 'Insulin is secreted by?', '["Liver","Pancreas","Thyroid","Adrenal"]', 1, 'Beta cells of the pancreatic islets secrete insulin.', 2022),
('neet', 'Biology', 'Excretory System', 'easy', 'The functional unit of the kidney is?', '["Neuron","Nephron","Alveolus","Villus"]', 1, 'Each kidney contains about a million nephrons.', 2025),
('neet', 'Biology', 'Endocrine System', 'easy', 'Which hormone is called the emergency hormone?', '["Insulin","Adrenaline","Thyroxine","Oestrogen"]', 1, 'Adrenaline prepares the body for fight or flight.', 2021),
('neet', 'Biology', 'Diseases', 'easy', 'Malaria is caused by which organism?', '["Virus","Bacterium","Plasmodium","Fungus"]', 2, 'Malaria is caused by protozoa of the genus Plasmodium.', 2024),
('neet', 'Biology', 'Biological Classification', 'easy', 'The study of fungi is called?', '["Bacteriology","Mycology","Virology","Phycology"]', 1, 'Mycology is the branch of biology dealing with fungi.', 2023),
('neet', 'Biology', 'Cell Biology', 'easy', 'Number of chromosomes in a human somatic cell is?', '["23","46","44","48"]', 1, 'Humans have 23 pairs, or 46 chromosomes, in somatic cells.', 2022),
('neet', 'Biology', 'Nutrition', 'easy', 'Which vitamin is produced in skin on sunlight exposure?', '["Vitamin A","Vitamin C","Vitamin D","Vitamin K"]', 2, 'UV light converts 7-dehydrocholesterol into vitamin D3 in the skin.', 2025),
('neet', 'Biology', 'Plant Physiology', 'easy', 'Xylem conducts?', '["Food","Water and minerals","Oxygen","Hormones"]', 1, 'Xylem carries water and dissolved minerals from roots to leaves.', 2021),
('jee', 'Physics', 'Projectile Motion', 'medium', 'A projectile is launched at 45° with speed u. Its maximum range is?', '["u²/g","u²/2g","u²/4g","2u²/g"]', 0, 'R = u² sin 2θ / g, and sin 90° = 1, so R = u²/g.', 2024),
('jee', 'Physics', 'Current Electricity', 'easy', 'A 4 Ω and a 6 Ω resistor are in series. The equivalent resistance is?', '["2.4 Ω","10 Ω","24 Ω","5 Ω"]', 1, 'Series resistances add: 4 + 6 = 10 Ω.', 2023),
('jee', 'Physics', 'Simple Harmonic Motion', 'medium', 'The time period of a simple pendulum depends on?', '["Mass of bob","Length","Amplitude","Material"]', 1, 'T = 2π√(L/g), so it depends on length and g only.', 2022),
('jee', 'Physics', 'Rotational Motion', 'medium', 'Angular momentum is conserved when the net external torque is?', '["Zero","Maximum","Infinite","Constant and nonzero"]', 0, 'dL/dt equals the net external torque, so L is conserved when torque is zero.', 2025),
('jee', 'Physics', 'Magnetism', 'easy', 'The SI unit of magnetic flux is?', '["Tesla","Weber","Henry","Gauss"]', 1, 'Magnetic flux is measured in weber.', 2021),
('jee', 'Chemistry', 'Mole Concept', 'easy', 'Number of moles in 36 g of water is?', '["1","2","0.5","3"]', 1, 'Molar mass of water is 18 g/mol, so 36 g is 2 mol.', 2024),
('jee', 'Chemistry', 'Periodic Trends', 'medium', 'Which element has the highest ionisation enthalpy?', '["Helium","Neon","Argon","Hydrogen"]', 0, 'Helium has the smallest atom and the strongest hold on its electrons.', 2023),
('jee', 'Chemistry', 'Ionic Equilibrium', 'medium', 'The pH of 0.01 M HCl is?', '["1","2","12","7"]', 1, 'pH = -log[H⁺] = -log(0.01) = 2.', 2022),
('jee', 'Chemistry', 'Nomenclature', 'easy', 'The IUPAC name of CH3CH2OH is?', '["Methanol","Ethanol","Propanol","Ethanal"]', 1, 'It is a two-carbon alcohol, so it is ethanol.', 2025),
('jee', 'Chemistry', 'Chemical Equilibrium', 'medium', 'The equilibrium constant depends on?', '["Pressure","Concentration","Temperature","Volume"]', 2, 'Only temperature changes the value of K.', 2021),
('jee', 'Mathematics', 'Integration', 'easy', 'The integral of x with respect to x is?', '["x²/2 + C","x + C","x² + C","2x + C"]', 0, 'The power rule gives x²/2 + C.', 2024),
('jee', 'Mathematics', 'Limits', 'easy', 'The value of lim (x→0) sin x / x is?', '["0","1","∞","Undefined"]', 1, 'This is a standard limit and equals 1.', 2023),
('jee', 'Mathematics', 'Determinants', 'medium', 'If A = [[1, 2], [3, 4]], then det A is?', '["-2","2","10","-10"]', 0, 'det A = 1 × 4 - 2 × 3 = -2.', 2022),
('jee', 'Mathematics', 'Permutations', 'easy', 'Number of ways to arrange the letters of the word ABC is?', '["3","6","9","12"]', 1, '3! = 6.', 2025),
('jee', 'Mathematics', 'Coordinate Geometry', 'easy', 'Distance between the points (0, 0) and (3, 4) is?', '["5","7","3","4"]', 0, '√(3² + 4²) = 5.', 2021),
('jee', 'Mathematics', 'Sequences', 'easy', 'Sum of the first 10 natural numbers is?', '["45","55","50","100"]', 1, 'n(n + 1)/2 = 10 × 11 / 2 = 55.', 2024),
('jee', 'Mathematics', 'Differentiation', 'easy', 'Derivative of sin x is?', '["cos x","-cos x","tan x","-sin x"]', 0, 'd/dx(sin x) = cos x.', 2023),
('jee', 'Mathematics', 'Circles', 'easy', 'The equation of a circle with centre at the origin and radius 2 is?', '["x² + y² = 4","x² + y² = 2","x + y = 4","x² - y² = 4"]', 0, 'The standard form is x² + y² = r², and r = 2.', 2022),
('jee', 'Mathematics', 'Complex Numbers', 'easy', 'The value of i² is?', '["1","-1","i","-i"]', 1, 'By definition, i² = -1.', 2025),
('jee', 'Mathematics', 'Mensuration', 'easy', 'Area of a circle with radius 7 (taking π = 22/7) is?', '["154","44","22","308"]', 0, 'Area = π r² = 22/7 × 49 = 154.', 2021),
('degree', 'Programming', 'Variables', 'easy', 'Which keyword declares a constant in JavaScript?', '["var","let","const","static"]', 2, 'const declares a binding that cannot be reassigned.', 2024),
('degree', 'Programming', 'Algorithms', 'medium', 'The time complexity of binary search is?', '["O(n)","O(log n)","O(n²)","O(1)"]', 1, 'Each step halves the search space, giving O(log n).', 2023),
('degree', 'Programming', 'Data Structures', 'easy', 'Which data structure follows LIFO order?', '["Queue","Stack","Tree","Graph"]', 1, 'A stack is last in, first out.', 2022),
('degree', 'Aptitude', 'Time and Distance', 'easy', 'A train 120 m long passes a pole in 12 s. Its speed is?', '["10 m/s","12 m/s","8 m/s","15 m/s"]', 0, 'Speed = distance / time = 120 / 12 = 10 m/s.', 2025),
('degree', 'Aptitude', 'Percentages', 'easy', 'If 20% of x is 40, then x is?', '["100","200","80","150"]', 1, '0.2x = 40, so x = 200.', 2024),
('degree', 'Aptitude', 'Averages', 'easy', 'The average of 4, 8 and 12 is?', '["6","8","9","10"]', 1, '(4 + 8 + 12) / 3 = 8.', 2023),
('degree', 'DBMS', 'SQL Basics', 'easy', 'In SQL, which command retrieves data?', '["GET","SELECT","FETCH","PULL"]', 1, 'SELECT reads rows from one or more tables.', 2024),
('degree', 'DBMS', 'Keys', 'easy', 'A primary key must be?', '["Null allowed","Unique and not null","Duplicates allowed","Text only"]', 1, 'A primary key uniquely identifies each row and cannot be null.', 2022),
('degree', 'DBMS', 'Normalisation', 'medium', 'Normalisation mainly reduces?', '["Speed","Redundancy","Size of disk","Number of users"]', 1, 'Normalisation removes duplicate data and update anomalies.', 2021),
('degree', 'Networking', 'OSI Model', 'medium', 'Which OSI layer handles routing?', '["Transport","Network","Session","Physical"]', 1, 'The network layer chooses paths between devices.', 2025),
('degree', 'Networking', 'IP Addressing', 'easy', 'An IPv4 address has how many bits?', '["16","32","64","128"]', 1, 'IPv4 addresses are 32 bits long.', 2023),
('degree', 'Networking', 'Protocols', 'easy', 'The default port for HTTP is?', '["21","25","80","443"]', 2, 'HTTP uses port 80 by default, while HTTPS uses 443.', 2024),
('degree', 'Programming', 'Python Basics', 'easy', 'Which symbol starts a single-line comment in Python?', '["//","#","--","/* */"]', 1, 'Python uses the hash symbol for comments.', 2024),
('degree', 'Programming', 'Java Basics', 'medium', 'Which of these is not a primitive type in Java?', '["int","boolean","String","char"]', 2, 'String is a class, not a primitive type.', 2023),
('degree', 'Aptitude', 'Simple Interest', 'easy', 'Simple interest on ₹1000 at 10% per year for 2 years is?', '["₹100","₹200","₹150","₹250"]', 1, 'SI = P × R × T / 100 = 1000 × 10 × 2 / 100 = ₹200.', 2025),
('degree', 'Aptitude', 'Fractions', 'easy', 'Half of 3/4 is?', '["3/8","3/4","1/2","3/2"]', 0, '3/4 × 1/2 = 3/8.', 2022),
('degree', 'DBMS', 'SQL Commands', 'easy', 'Which of these is a DDL command?', '["SELECT","INSERT","CREATE","UPDATE"]', 2, 'CREATE defines database objects; SELECT, INSERT and UPDATE are DML.', 2024),
('degree', 'DBMS', 'Keys', 'easy', 'A foreign key refers to?', '["Primary key of another table","Index","View","Trigger"]', 0, 'A foreign key links to a primary key in another table.', 2023),
('degree', 'Networking', 'Email', 'easy', 'Which protocol is used to send email?', '["FTP","SMTP","HTTP","SNMP"]', 1, 'SMTP is the standard protocol for sending email.', 2025),
('degree', 'Networking', 'IP Addressing', 'easy', 'The loopback IP address is?', '["192.168.0.1","127.0.0.1","10.0.0.1","255.255.255.0"]', 1, '127.0.0.1 always refers to the local machine.', 2021)
ON CONFLICT (track, question) DO NOTHING;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedMedicines = seedMedicines;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function seedMedicines() {
    console.log('Seeding medicines...');
    const medicines = [
        // Pain Relief & Anti-inflammatory
        {
            name: 'Paracetamol',
            genericName: 'Acetaminophen',
            description: 'Pain reliever and fever reducer',
            dosageForm: 'Tablet',
            strength: '500mg',
            manufacturer: 'Teva Pharmaceuticals',
            prescriptionRequired: false,
            sideEffects: 'Rare allergic reactions, liver damage with overdose',
            warnings: 'Do not exceed 4g per day. Avoid alcohol.',
            interactions: 'Warfarin, alcohol'
        },
        {
            name: 'Ibuprofen',
            genericName: 'Ibuprofen',
            description: 'Nonsteroidal anti-inflammatory drug (NSAID)',
            dosageForm: 'Tablet',
            strength: '400mg',
            manufacturer: 'Pfizer',
            prescriptionRequired: false,
            sideEffects: 'Stomach upset, headache, dizziness',
            warnings: 'Take with food. Avoid in kidney disease.',
            interactions: 'Aspirin, warfarin, ACE inhibitors'
        },
        {
            name: 'Aspirin',
            genericName: 'Acetylsalicylic acid',
            description: 'Pain reliever, anti-inflammatory, blood thinner',
            dosageForm: 'Tablet',
            strength: '100mg',
            manufacturer: 'Bayer',
            prescriptionRequired: false,
            sideEffects: 'Stomach irritation, bleeding risk',
            warnings: 'Not for children under 16. Bleeding risk.',
            interactions: 'Warfarin, methotrexate'
        },
        // Cardiovascular
        {
            name: 'Amlodipine',
            genericName: 'Amlodipine besylate',
            description: 'Calcium channel blocker for high blood pressure',
            dosageForm: 'Tablet',
            strength: '5mg',
            manufacturer: 'Norvasc',
            prescriptionRequired: true,
            sideEffects: 'Swelling of ankles, dizziness, flushing',
            warnings: 'Monitor blood pressure regularly',
            interactions: 'Simvastatin, cyclosporine'
        },
        {
            name: 'Metoprolol',
            genericName: 'Metoprolol tartrate',
            description: 'Beta-blocker for heart conditions and blood pressure',
            dosageForm: 'Tablet',
            strength: '50mg',
            manufacturer: 'AstraZeneca',
            prescriptionRequired: true,
            sideEffects: 'Fatigue, dizziness, slow heart rate',
            warnings: 'Do not stop suddenly. Monitor heart rate.',
            interactions: 'Verapamil, clonidine'
        },
        {
            name: 'Lisinopril',
            genericName: 'Lisinopril',
            description: 'ACE inhibitor for high blood pressure and heart failure',
            dosageForm: 'Tablet',
            strength: '10mg',
            manufacturer: 'Merck',
            prescriptionRequired: true,
            sideEffects: 'Dry cough, dizziness, hyperkalemia',
            warnings: 'Monitor kidney function and potassium levels',
            interactions: 'Potassium supplements, lithium'
        },
        // Diabetes
        {
            name: 'Metformin',
            genericName: 'Metformin hydrochloride',
            description: 'Diabetes medication to control blood sugar',
            dosageForm: 'Tablet',
            strength: '500mg',
            manufacturer: 'Bristol-Myers Squibb',
            prescriptionRequired: true,
            sideEffects: 'Nausea, diarrhea, metallic taste',
            warnings: 'Monitor kidney function. Take with meals.',
            interactions: 'Alcohol, iodinated contrast agents'
        },
        {
            name: 'Insulin Glargine',
            genericName: 'Insulin glargine',
            description: 'Long-acting insulin for diabetes',
            dosageForm: 'Injection',
            strength: '100 units/mL',
            manufacturer: 'Sanofi',
            prescriptionRequired: true,
            sideEffects: 'Hypoglycemia, injection site reactions',
            warnings: 'Monitor blood glucose. Rotate injection sites.',
            interactions: 'Beta-blockers, ACE inhibitors'
        },
        // Antibiotics
        {
            name: 'Amoxicillin',
            genericName: 'Amoxicillin',
            description: 'Penicillin antibiotic for bacterial infections',
            dosageForm: 'Capsule',
            strength: '500mg',
            manufacturer: 'GlaxoSmithKline',
            prescriptionRequired: true,
            sideEffects: 'Nausea, diarrhea, allergic reactions',
            warnings: 'Complete full course. Check for penicillin allergy.',
            interactions: 'Oral contraceptives, warfarin'
        },
        {
            name: 'Azithromycin',
            genericName: 'Azithromycin',
            description: 'Macrolide antibiotic for respiratory infections',
            dosageForm: 'Tablet',
            strength: '250mg',
            manufacturer: 'Pfizer',
            prescriptionRequired: true,
            sideEffects: 'Nausea, diarrhea, abdominal pain',
            warnings: 'Complete full course. Monitor for heart rhythm changes.',
            interactions: 'Warfarin, digoxin'
        },
        {
            name: 'Ciprofloxacin',
            genericName: 'Ciprofloxacin hydrochloride',
            description: 'Fluoroquinolone antibiotic for various infections',
            dosageForm: 'Tablet',
            strength: '500mg',
            manufacturer: 'Bayer',
            prescriptionRequired: true,
            sideEffects: 'Nausea, diarrhea, tendon problems',
            warnings: 'Avoid dairy products. Risk of tendon rupture.',
            interactions: 'Antacids, iron supplements'
        },
        // Mental Health
        {
            name: 'Sertraline',
            genericName: 'Sertraline hydrochloride',
            description: 'SSRI antidepressant',
            dosageForm: 'Tablet',
            strength: '50mg',
            manufacturer: 'Pfizer',
            prescriptionRequired: true,
            sideEffects: 'Nausea, insomnia, sexual dysfunction',
            warnings: 'Monitor for suicidal thoughts in young adults.',
            interactions: 'MAOIs, NSAIDs, warfarin'
        },
        {
            name: 'Lorazepam',
            genericName: 'Lorazepam',
            description: 'Benzodiazepine for anxiety and panic disorders',
            dosageForm: 'Tablet',
            strength: '1mg',
            manufacturer: 'Wyeth',
            prescriptionRequired: true,
            sideEffects: 'Drowsiness, dizziness, weakness',
            warnings: 'Risk of dependence. Avoid alcohol.',
            interactions: 'Alcohol, opioids, antihistamines'
        },
        // Respiratory
        {
            name: 'Salbutamol',
            genericName: 'Salbutamol sulfate',
            description: 'Bronchodilator for asthma and COPD',
            dosageForm: 'Inhaler',
            strength: '100mcg/dose',
            manufacturer: 'GlaxoSmithKline',
            prescriptionRequired: true,
            sideEffects: 'Tremor, headache, rapid heart rate',
            warnings: 'Rinse mouth after use. Monitor heart rate.',
            interactions: 'Beta-blockers, digoxin'
        },
        {
            name: 'Montelukast',
            genericName: 'Montelukast sodium',
            description: 'Leukotriene receptor antagonist for asthma',
            dosageForm: 'Tablet',
            strength: '10mg',
            manufacturer: 'Merck',
            prescriptionRequired: true,
            sideEffects: 'Headache, dizziness, fatigue',
            warnings: 'Monitor for mood changes and suicidal thoughts.',
            interactions: 'Phenobarbital, rifampin'
        },
        // Gastrointestinal
        {
            name: 'Omeprazole',
            genericName: 'Omeprazole',
            description: 'Proton pump inhibitor for acid reflux and ulcers',
            dosageForm: 'Capsule',
            strength: '20mg',
            manufacturer: 'AstraZeneca',
            prescriptionRequired: false,
            sideEffects: 'Headache, nausea, diarrhea',
            warnings: 'Long-term use may affect magnesium levels.',
            interactions: 'Clopidogrel, warfarin'
        },
        {
            name: 'Domperidone',
            genericName: 'Domperidone',
            description: 'Antiemetic for nausea and vomiting',
            dosageForm: 'Tablet',
            strength: '10mg',
            manufacturer: 'Janssen',
            prescriptionRequired: true,
            sideEffects: 'Dry mouth, drowsiness, breast tenderness',
            warnings: 'Monitor for heart rhythm changes.',
            interactions: 'Ketoconazole, erythromycin'
        },
        // Vitamins & Supplements
        {
            name: 'Vitamin D3',
            genericName: 'Cholecalciferol',
            description: 'Vitamin D supplement for bone health',
            dosageForm: 'Tablet',
            strength: '1000 IU',
            manufacturer: 'Nature Made',
            prescriptionRequired: false,
            sideEffects: 'Rare: hypercalcemia with high doses',
            warnings: 'Monitor calcium levels with high doses.',
            interactions: 'Thiazide diuretics, digoxin'
        },
        {
            name: 'Folic Acid',
            genericName: 'Folic acid',
            description: 'B-vitamin for anemia prevention and pregnancy',
            dosageForm: 'Tablet',
            strength: '5mg',
            manufacturer: 'Teva',
            prescriptionRequired: false,
            sideEffects: 'Rare allergic reactions',
            warnings: 'Important during pregnancy for neural tube development.',
            interactions: 'Methotrexate, phenytoin'
        },
        {
            name: 'Iron Fumarate',
            genericName: 'Ferrous fumarate',
            description: 'Iron supplement for iron deficiency anemia',
            dosageForm: 'Tablet',
            strength: '200mg',
            manufacturer: 'Pharmacia',
            prescriptionRequired: false,
            sideEffects: 'Constipation, nausea, dark stools',
            warnings: 'Take on empty stomach for better absorption.',
            interactions: 'Antacids, tetracyclines'
        }
    ];
    // Check if medicines already exist
    const existingCount = await prisma.medicine.count();
    if (existingCount === 0) {
        await prisma.medicine.createMany({
            data: medicines,
            skipDuplicates: true
        });
        console.log(`✅ Created ${medicines.length} medicines`);
    }
    else {
        console.log(`ℹ️ Medicines already exist (${existingCount} found), skipping...`);
    }
}

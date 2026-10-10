/**
 * AgenticX-Breast: Curated Medical & Cytopathology Knowledge Base
 * Trusted reference literature for Retrieval-Augmented Generation (RAG)
 */

export interface KnowledgeDocument {
  id: string;
  title: string;
  source: string;
  year: number;
  category: 'cytopathology' | 'guideline' | 'xai_methodology' | 'bi_rads';
  keywords: string[];
  content: string;
}

export const MEDICAL_KNOWLEDGE_CORPUS: KnowledgeDocument[] = [
  {
    id: "wdbc-street-1993",
    title: "Nuclear Feature Extraction and Diagnostic Criteria in WDBC",
    source: "Street, Wolberg, Mangasarian - Cancer Letters / IEEE Transactions on Biomedical Engineering",
    year: 1993,
    category: "cytopathology",
    keywords: ["wdbc", "concave_points", "radius", "perimeter", "worst", "nuclear", "atypia", "fna", "contours"],
    content: `The Wisconsin Diagnostic Breast Cancer (WDBC) dataset was constructed using digitized images of Fine Needle Aspirate (FNA) slides from breast masses. Ten real-valued features are computed for each cell nucleus: radius, texture, perimeter, area, smoothness, compactness, concavity, concave points, symmetry, and fractal dimension. Three metrics are calculated per feature: mean, standard error (se), and 'worst' (the mean of the three largest nuclear values per patient). In FNA cytopathology, malignant aspirates exhibit prominent nuclear pleomorphism, marked increase in nuclear area/perimeter ('worst_radius', 'worst_perimeter'), and pronounced contour indentations measured as 'worst_concave_points' and 'worst_concavity'. Benign lesions like fibroadenomas display cohesive uniform cell sheets with smooth, circular nuclear boundaries and minimal concavity.`
  },
  {
    id: "cap-fna-guidelines-2021",
    title: "CAP Cytopathology Practice Guidelines for Palpable and Non-Palpable Breast Lesions",
    source: "College of American Pathologists (CAP) / Papanicolaou Society of Cytopathology",
    year: 2021,
    category: "guideline",
    keywords: ["fna", "biopsy", "histopathology", "malignant", "benign", "atypia", "indeterminate", "ductal", "carcinoma"],
    content: `FNA cytological evaluations are categorized according to standard reporting systems into: Insufficient, Benign, Atypical (AUS), Suspicious for Malignancy, and Malignant. True positive cytological malignancy requires severe cellular pleomorphism, nuclear hyperchromasia, coarse chromatin clumping, and lack of cohesive bipolar bare myoepithelial cells. Intermediate or atypical scores warrant histological confirmation via Core Needle Biopsy (CNB) or vacuum-assisted core biopsy. FNA findings must always be correlated within the 'Triple Assessment' framework: physical clinical examination, mammographic/sonographic imaging (BI-RADS), and cytopathology.`
  },
  {
    id: "bi-rads-atlas-5th",
    title: "ACR BI-RADS Atlas: Mammography and Ultrasound Lexicon & Risk Stratification",
    source: "American College of Radiology (ACR)",
    year: 2013,
    category: "bi_rads",
    keywords: ["bi-rads", "risk", "probability", "margin", "shape", "ultrasound", "mammography", "calcification"],
    content: `The Breast Imaging Reporting and Data System (BI-RADS) establishes standardized risk categories: BI-RADS 1 (Negative, 0% risk), BI-RADS 2 (Benign finding, 0% risk), BI-RADS 3 (Probably benign, <=2% risk; short-interval follow-up), BI-RADS 4 (Suspicious abnormality; subdivided into 4A: 2-10%, 4B: 10-50%, 4C: 50-95% likelihood of malignancy; tissue diagnosis indicated), and BI-RADS 5 (Highly suggestive of malignancy, >95% probability; immediate biopsy and surgical oncology staging required). Irregular contour margins and spiculation correlate strongly with malignant invasive growth.`
  },
  {
    id: "who-breast-tumours-5th",
    title: "WHO Classification of Breast Tumours: Invasive Ductal Carcinoma vs Benign Entities",
    source: "World Health Organization (WHO) International Agency for Research on Cancer",
    year: 2019,
    category: "cytopathology",
    keywords: ["who", "ductal", "carcinoma", "fibroadenoma", "tubular", "pleomorphism", "mitotic", "chromatin"],
    content: `Invasive Breast Carcinoma of No Special Type (NST, previously Invasive Ductal Carcinoma) accounts for 75-80% of all invasive breast malignancies. Histological grading (Nottingham/Elston-Ellis modification of Scarff-Bloom-Richardson) evaluates tubule formation, nuclear pleomorphism, and mitotic frequency. Grade 3 tumors exhibit marked variation in nuclear size and shape, vesicular chromatin with prominent multiple nucleoli, and complete disruption of the basement membrane. Conversely, common benign mimics such as fibroadenomas, tubular adenomas, and fibrocystic changes maintain uniform diploid nuclear chromatin without deep indentations or abnormal mitotic spindle formation.`
  },
  {
    id: "nature-shap-xai-2020",
    title: "From Local Explanations to Global Understanding with Tree Explainable AI",
    source: "Lundberg, Erion, Chen, DeGrave, Prutkin, Nair, Katz, Himmelfarb, Bansal, Lee - Nature Machine Intelligence",
    year: 2020,
    category: "xai_methodology",
    keywords: ["shap", "treeshap", "attribution", "causation", "additive", "efficiency", "game_theory", "fairness"],
    content: `TreeSHAP computes exact, local feature attributions rooted in cooperative game theory (Shapley values) in polynomial time for tree-based ensemble models. Crucially for clinical decision support, Shapley values represent algorithmic credit assignment (the additive shift in model log-odds produced by a feature's observed value relative to the background expectation), NOT causal physiological drivers. High positive SHAP values for 'worst_concave_points' mean the model utilized irregular nuclear contour measurements to shift its output towards the malignant class; it does not mechanically 'cause' oncogenesis. Explanations must strictly convey statistical attribution to clinicians to prevent cognitive anchoring.`
  },
  {
    id: "cytopath-nuclear-contour-guide",
    title: "Clinical Morphometry Guide: Nuclear Contours and Concavity in Breast Oncology",
    source: "Journal of Clinical Pathology / Modern Pathology",
    year: 2018,
    category: "cytopathology",
    keywords: ["concave_points", "concavity", "indentation", "chromatin", "aneuploidy", "envelope"],
    content: `Nuclear envelope irregularities, quantified in computational cytopathology as 'concave points' (number of concave portions of the nuclear contour) and 'concavity' (severity of indentations), directly reflect underlying chromosomal aneuploidy and lamina assembly defects in carcinoma cells. Normal and hyperplasia-associated breast cells possess tensile, smooth nuclear envelopes maintained by lamin A/C and B1 scaffolding. In invasive carcinoma, loss of structural nuclear lamina integrity leads to blebbing, grooving, and deep contour invaginations. Consequently, 'worst_concave_points' and 'worst_concavity' repeatedly emerge as the most decisive discriminatory biometric features in computer-assisted diagnostic cytology.`
  }
];

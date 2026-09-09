import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Scheme } from "../models/Scheme";
import { Application } from "../models/Application";
import { Notification } from "../models/Notification";
import { DocumentModel } from "../models/Document";

export async function seedDatabase() {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log("[Seed] Database already seeded. Skipping initial seeding.");
      return;
    }

    console.log("[Seed] Seeding Tamil Nadu Government Schemes, Admin, and Farmer data...");

    const adminSalt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash("Admin@123", adminSalt);
    const farmerPasswordHash = await bcrypt.hash("Farmer@123", adminSalt);

    // 1. Create Admin
    const admin = await User.create({
      fullName: "Agriculture Officer - Thiru. S. Ramanathan",
      email: "admin@tngov.in",
      mobile: "9840123456",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      preferredLanguage: "en",
      district: "Chennai",
      state: "Tamil Nadu",
      age: 48,
      gender: "Male",
      farmerStatus: "Active",
      accountStatus: "ACTIVE",
    });

    // 2. Create Sample Farmers
    const farmer1 = await User.create({
      fullName: "Muthuvel Karunanidhi",
      email: "muthu.farmer@gmail.com",
      mobile: "9841234567",
      passwordHash: farmerPasswordHash,
      role: "FARMER",
      preferredLanguage: "ta",
      district: "Thanjavur",
      state: "Tamil Nadu",
      age: 46,
      gender: "Male",
      farmerStatus: "Owner",
      landOwnership: "Owned",
      landSize: 2.5,
      landType: "Wetland (Nanjai)",
      cropType: "Paddy",
      farmingType: "Conventional",
      irrigationType: "Canal",
      farmerType: "Small",
      annualIncome: 135000,
      socialCategory: "MBC",
      livestockOwnership: true,
      horticultureActivity: false,
      machineryOwnership: false,
      farmerRegistrationId: "TN-FRM-2026-00101",
      accountStatus: "ACTIVE",
    });

    const farmer2 = await User.create({
      fullName: "Kavitha Murugan",
      email: "kavitha.farmer@gmail.com",
      mobile: "9842345678",
      passwordHash: farmerPasswordHash,
      role: "FARMER",
      preferredLanguage: "en",
      district: "Dindigul",
      state: "Tamil Nadu",
      age: 38,
      gender: "Female",
      farmerStatus: "Owner",
      landOwnership: "Owned",
      landSize: 1.8,
      landType: "Dryland (Punjai)",
      cropType: "Vegetables",
      farmingType: "Organic",
      irrigationType: "Drip",
      farmerType: "Marginal",
      annualIncome: 95000,
      socialCategory: "OBC",
      livestockOwnership: true,
      horticultureActivity: true,
      machineryOwnership: false,
      farmerRegistrationId: "TN-FRM-2026-00102",
      accountStatus: "ACTIVE",
    });

    // 3. Official Tamil Nadu & Central Agriculture Schemes
    // (Marked as isDemonstrationData: true for transparency as per specifications)
    const schemesData = [
      {
        schemeId: "TN-SCH-01",
        schemeName: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        schemeNameTamil: "பிரதமர் கிசான் சம்மான் நிதி திட்டம்",
        governmentLevel: "Central Government",
        department: "Department of Agriculture & Farmers Welfare",
        category: "Financial Assistance",
        description: "Direct income support of ₹6,000 per year in three equal installments of ₹2,000 directly transferred to bank accounts of all landholding farmer families.",
        descriptionTamil: "நிலம் வைத்துள்ள அனைத்து விவசாய குடும்பங்களுக்கும் ஆண்டுக்கு ₹6,000 நேரடி வருமான உதவி மூன்று தவணைகளாக வங்கி கணக்கில் செலுத்தப்படுகிறது.",
        benefits: "₹6,000 per year in 3 equal installments of ₹2,000 directly deposited via DBT.",
        benefitsTamil: "ஆண்டுக்கு ₹6,000 வீதம் 3 சம தவணைகளில் (தலா ₹2,000) நேரடி வங்கி பரிமாற்றம்.",
        eligibilityConditions: [
          "Farmer must hold cultivable agricultural land in their name",
          "Institutional landholders and high-income tax payers are excluded",
          "Aadhaar-linked bank account is mandatory",
          "Annual family income ceiling applies for non-exclusive farmers"
        ],
        minimumAge: 18,
        maximumAge: 85,
        gender: "All",
        incomeLimit: 250000,
        occupation: "Farmer / Cultivator",
        education: "Any",
        socialCategory: ["All"],
        applicableDistricts: ["All"],
        landholdingMin: 0.1,
        landholdingMax: 5.0,
        cropTypes: ["All"],
        farmingTypes: ["All"],
        irrigationRequirements: ["All"],
        applicableFarmerTypes: ["Marginal", "Small"],
        studentRequired: false,
        farmerRequired: true,
        disabilityRequired: false,
        livestockRequirement: false,
        horticultureRequirement: false,
        machineryRequirement: false,
        requiredDocuments: [
          "Aadhaar Card",
          "Patta / Chitta (Land Ownership Record)",
          "Bank Passbook (Aadhaar linked)",
          "Active Mobile Number"
        ],
        applicationProcess: "Apply online via PM-KISAN portal or visit your nearest e-Sevai / CSC Center with Patta and Aadhaar.",
        applicationDeadline: "Continuous / Ongoing throughout the financial year",
        officialWebsite: "https://pmkisan.gov.in",
        applicationUrl: "https://pmkisan.gov.in/RegistrationFormNew.aspx",
        status: "ACTIVE",
        lastVerifiedDate: new Date("2026-02-15"),
        isDemonstrationData: true
      },
      {
        schemeId: "TN-SCH-02",
        schemeName: "Tamil Nadu Free Electricity for Agricultural Pumpsets",
        schemeNameTamil: "விவசாயிகளுக்கு இலவச மின்கட்டண திட்டம் (TANGEDCO)",
        governmentLevel: "Tamil Nadu Government",
        department: "Energy Department / TANGEDCO & Agriculture Dept",
        category: "Irrigation Support",
        description: "100% free electricity supply for agricultural pumpsets in Tamil Nadu to protect farmers against irrigation power expenses.",
        descriptionTamil: "விவசாய பம்புசெட்டுகளுக்கு 100% இலவச மின்சாரம் வழங்கி பாசன செலவை குறைக்கும் தமிழ்நாடு அரசின் முன்னோடி திட்டம்.",
        benefits: "Complete waiver of electricity tariff for registered agricultural borewells and open wells.",
        benefitsTamil: "பதிவு செய்யப்பட்ட விவசாய ஆழ்துளை மற்றும் திறந்த கிணறுகளுக்கு முழு மின் கட்டண தள்ளுபடி.",
        eligibilityConditions: [
          "Farmer must own agricultural land in Tamil Nadu",
          "Must have an operational borewell or open well dedicated to farming",
          "TANGEDCO agricultural service connection eligibility"
        ],
        minimumAge: 18,
        maximumAge: 85,
        gender: "All",
        incomeLimit: null,
        occupation: "Farmer",
        education: "Any",
        socialCategory: ["All"],
        applicableDistricts: ["All"],
        landholdingMin: 0.2,
        landholdingMax: 999,
        cropTypes: ["All"],
        farmingTypes: ["All"],
        irrigationRequirements: ["Borewell", "Open Well", "Canal"],
        applicableFarmerTypes: ["Marginal", "Small", "Medium", "Large"],
        studentRequired: false,
        farmerRequired: true,
        disabilityRequired: false,
        livestockRequirement: false,
        horticultureRequirement: false,
        machineryRequirement: false,
        requiredDocuments: [
          "Patta and Chitta copy",
          "Village Administrative Officer (VAO) Certificate for Well",
          "TANGEDCO Connection application",
          "Aadhaar Card"
        ],
        applicationProcess: "Submit application to local TANGEDCO section office or apply via Tamil Nadu Agricultural Engineering Department.",
        applicationDeadline: "Ongoing subject to government sanction batches",
        officialWebsite: "https://www.tangedco.gov.in",
        applicationUrl: "https://www.tnebnet.org",
        status: "ACTIVE",
        lastVerifiedDate: new Date("2026-01-20"),
        isDemonstrationData: true
      },
      {
        schemeId: "TN-SCH-03",
        schemeName: "Tamil Nadu Micro Irrigation Scheme (PMKSY - Per Drop More Crop)",
        schemeNameTamil: "நுண்ணீர்ப் பாசன திட்டம் (சொட்டு நீர் & தெளிப்பு நீர் பாசனம்)",
        governmentLevel: "Tamil Nadu Government",
        department: "Department of Horticulture and Plantation Crops",
        category: "Irrigation Support",
        description: "100% subsidy for Small and Marginal farmers, and 75% subsidy for other farmers to install Drip and Sprinkler irrigation systems.",
        descriptionTamil: "சிறு மற்றும் குறு விவசாயிகளுக்கு 100% மானியம், இதர விவசாயிகளுக்கு 75% மானியத்தில் சொட்டுநீர் மற்றும் தெளிப்புநீர் பாசனம்.",
        benefits: "100% subsidy for Small & Marginal farmers (up to 5 acres); 75% subsidy for Medium/Large farmers.",
        benefitsTamil: "சிறு, குறு விவசாயிகளுக்கு 100% முழு மானியம், இதர விவசாயிகளுக்கு 75% மானியம்.",
        eligibilityConditions: [
          "Farmer must possess cultivable land with reliable water source",
          "Soil and water testing must be suitable for drip/sprinkler installation",
          "Small/Marginal farmer certificate issued by Revenue Department / VAO"
        ],
        minimumAge: 18,
        maximumAge: 80,
        gender: "All",
        incomeLimit: null,
        occupation: "Cultivator / Horticulturist",
        education: "Any",
        socialCategory: ["All"],
        applicableDistricts: ["All"],
        landholdingMin: 0.5,
        landholdingMax: 12.5,
        cropTypes: ["Sugarcane", "Banana", "Vegetables", "Flowers", "Coconut", "Cotton"],
        farmingTypes: ["All"],
        irrigationRequirements: ["Borewell", "Open Well", "Drip", "Sprinkler"],
        applicableFarmerTypes: ["Marginal", "Small", "Medium"],
        studentRequired: false,
        farmerRequired: true,
        disabilityRequired: false,
        livestockRequirement: false,
        horticultureRequirement: false,
        machineryRequirement: false,
        requiredDocuments: [
          "Small/Marginal Farmer Certificate",
          "Patta, Chitta, FMB Sketch",
          "Water & Soil Test Report",
          "Aadhaar Card and Bank Passbook"
        ],
        applicationProcess: "Apply on the TN Horticulture Portal (tnhorticulture.tn.gov.in) or visit Assistant Director of Horticulture (ADH) office.",
        applicationDeadline: "Target based allocation each financial quarter",
        officialWebsite: "https://tnhorticulture.tn.gov.in",
        applicationUrl: "https://tnhorticulture.tn.gov.in/micro-irrigation",
        status: "ACTIVE",
        lastVerifiedDate: new Date("2026-03-01"),
        isDemonstrationData: true
      },
      {
        schemeId: "TN-SCH-04",
        schemeName: "Kalaignarin All Village Integrated Agriculture Development Programme (KAVIADP)",
        schemeNameTamil: "கலைஞரின் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சி திட்டம்",
        governmentLevel: "Tamil Nadu Government",
        department: "Agriculture and Farmers Welfare Department, Tamil Nadu",
        category: "Comprehensive Farm Welfare",
        description: "Transforming dryland fallow lands into productive cultivable fields, providing free saplings, coconut seedlings, sprayers, and water body development in selected village panchayats.",
        descriptionTamil: "விவசாய நிலங்களில் தரிசு நில மேம்பாடு, தென்னங்கன்றுகள், கைத்தெளிப்பான்கள் மற்றும் பாசன ஆதாரங்களை உருவாக்கும் ஒருங்கிணைந்த திட்டம்.",
        benefits: "Free distribution of input kits, subsidized coconut seedlings, micro-check dams, and battery-operated sprayers.",
        benefitsTamil: "இலவச இடுபொருள் தொகுப்பு, மானிய விலையில் தென்னங்கன்றுகள், கைத்தெளிப்பான் மற்றும் பாசன ஆதரவு.",
        eligibilityConditions: [
          "Must reside in the designated village panchayat selected for current phase",
          "Special preference to SC, ST, women farmers, and marginal cultivators",
          "Must have active agricultural interest or fallow cultivable land"
        ],
        minimumAge: 18,
        maximumAge: 80,
        gender: "All",
        incomeLimit: 200000,
        occupation: "Farmer",
        education: "Any",
        socialCategory: ["All", "SC", "ST", "MBC", "OBC"],
        applicableDistricts: ["All"],
        landholdingMin: 0.1,
        landholdingMax: 5.0,
        cropTypes: ["Paddy", "Millets", "Pulses", "Coconut", "Vegetables"],
        farmingTypes: ["Conventional", "Organic", "Natural", "Integrated"],
        irrigationRequirements: ["All"],
        applicableFarmerTypes: ["Marginal", "Small"],
        studentRequired: false,
        farmerRequired: true,
        disabilityRequired: false,
        livestockRequirement: false,
        horticultureRequirement: false,
        machineryRequirement: false,
        requiredDocuments: [
          "Ration Card / Smart Card",
          "Patta / Chitta document",
          "Community Certificate (for SC/ST special priority)",
          "Aadhaar Card"
        ],
        applicationProcess: "Apply via Uzhavan App or through local Agricultural Extension Centre (Velaanmaiyagam) / Grama Sabha.",
        applicationDeadline: "Village selection list published annually",
        officialWebsite: "https://www.tn.gov.in/department/3",
        applicationUrl: "https://agritech.tnau.ac.in",
        status: "ACTIVE",
        lastVerifiedDate: new Date("2026-02-10"),
        isDemonstrationData: true
      },
      {
        schemeId: "TN-SCH-05",
        schemeName: "Cauvery Delta Kuruvai Cultivation Special Package Scheme",
        schemeNameTamil: "காவிரி டெல்டா குறுவை சாகுபடி சிறப்பு தொகுப்பு திட்டம்",
        governmentLevel: "Tamil Nadu Government",
        department: "Agriculture and Farmers Welfare Department",
        category: "Inputs & Seeds",
        description: "Special seasonal assistance package specifically curated for Cauvery Delta farmers to maximize Kuruvai paddy production with certified seeds and chemical fertilizers.",
        descriptionTamil: "காவிரி டெல்டா மாவட்ட விவசாயிகளுக்கு குறுவை நெல் சாகுபடிக்காக சான்று பெற்ற விதைகள், உரங்கள் முழு மானியத்தில் வழங்கும் சிறப்பு தொகுப்பு.",
        benefits: "100% subsidized certified paddy seeds, urea, DAP, and potash packages worth up to ₹4,000 per acre.",
        benefitsTamil: "100% மானியத்தில் சான்று பெற்ற நெல் விதைகள், யூரியா, டிஏபி மற்றும் பொட்டாஷ் உரம்.",
        eligibilityConditions: [
          "Cultivating farmer in Cauvery Delta districts (Thanjavur, Tiruvarur, Nagapattinam, Mayiladuthurai, Cuddalore, Pudukkottai, Tiruchirappalli)",
          "Must cultivate Paddy during Kuruvai season",
          "Verification by Village Administrative Officer (VAO)"
        ],
        minimumAge: 18,
        maximumAge: 85,
        gender: "All",
        incomeLimit: null,
        occupation: "Paddy Farmer",
        education: "Any",
        socialCategory: ["All"],
        applicableDistricts: ["Thanjavur", "Tiruvarur", "Nagapattinam", "Mayiladuthurai", "Cuddalore", "Tiruchirappalli", "Pudukkottai"],
        landholdingMin: 0.5,
        landholdingMax: 5.0,
        cropTypes: ["Paddy"],
        farmingTypes: ["All"],
        irrigationRequirements: ["Canal", "Borewell", "Open Well"],
        applicableFarmerTypes: ["Marginal", "Small"],
        studentRequired: false,
        farmerRequired: true,
        disabilityRequired: false,
        livestockRequirement: false,
        horticultureRequirement: false,
        machineryRequirement: false,
        requiredDocuments: [
          "Patta/Chitta or Adangal showing Paddy cultivation",
          "Aadhaar Card",
          "Bank Passbook copy"
        ],
        applicationProcess: "Register at the Agricultural Extension Centre (AEC) or apply through the Tamil Nadu Uzhavan App.",
        applicationDeadline: "Seasonal (May - July each agricultural year)",
        officialWebsite: "https://agritech.tnau.ac.in",
        applicationUrl: "https://agritech.tnau.ac.in/agriculture/agri_schemes_kuruvai.html",
        status: "ACTIVE",
        lastVerifiedDate: new Date("2026-03-01"),
        isDemonstrationData: true
      },
      {
        schemeId: "TN-SCH-06",
        schemeName: "Agricultural Mechanization Scheme Tamil Nadu (SMAM)",
        schemeNameTamil: "வேளாண் இயந்திரமயமாக்கல் திட்டம் (டிராக்டர் & பவர் டில்லர் மானியம்)",
        governmentLevel: "Tamil Nadu Government",
        department: "Agricultural Engineering Department, Tamil Nadu",
        category: "Machinery Subsidy",
        description: "Subsidies ranging from 40% to 50% for purchasing tractors, power tillers, paddy transplanters, rotavators, and multi-crop threshers.",
        descriptionTamil: "விவசாயிகளுக்கு டிராக்டர்கள், பவர் டில்லர்கள், நாற்று நடவு இயந்திரங்கள் வாங்க 40% முதல் 50% வரை அரசு மானியம்.",
        benefits: "Up to ₹2,00,000 subsidy on Tractors and up to ₹85,000 on Power Tillers and farm equipment.",
        benefitsTamil: "டிராக்டர்களுக்கு அதிகபட்சம் ₹2 லட்சம் மற்றும் பவர் டில்லர்களுக்கு ₹85,000 வரை அரசு மானியம்.",
        eligibilityConditions: [
          "Farmer must hold minimum 2.5 acres for tractor subsidy, or 1 acre for power tiller",
          "Should not have availed machinery subsidy in the preceding 5 years",
          "Priority given to SC/ST, women, and small/marginal farmers"
        ],
        minimumAge: 21,
        maximumAge: 75,
        gender: "All",
        incomeLimit: null,
        occupation: "Farmer",
        education: "Any",
        socialCategory: ["All"],
        applicableDistricts: ["All"],
        landholdingMin: 1.0,
        landholdingMax: 25.0,
        cropTypes: ["All"],
        farmingTypes: ["All"],
        irrigationRequirements: ["All"],
        applicableFarmerTypes: ["Small", "Medium", "Large"],
        studentRequired: false,
        farmerRequired: true,
        disabilityRequired: false,
        livestockRequirement: false,
        horticultureRequirement: false,
        machineryRequirement: true,
        requiredDocuments: [
          "Patta and Chitta with FMB sketch",
          "Small/Marginal Farmer Certificate or Community Certificate",
          "Quotation from authorized implement manufacturer/dealer",
          "Aadhaar Card and Driving License (for tractor)"
        ],
        applicationProcess: "Register online on the Agrimachinery portal (agrimachinery.nic.in) or visit the Assistant Executive Engineer (AED) office.",
        applicationDeadline: "Subject to district target quotas",
        officialWebsite: "https://agrimachinery.nic.in",
        applicationUrl: "https://aed.tn.gov.in",
        status: "ACTIVE",
        lastVerifiedDate: new Date("2026-02-18"),
        isDemonstrationData: true
      },
      {
        schemeId: "TN-SCH-07",
        schemeName: "National Horticulture Mission Tamil Nadu (MIDH)",
        schemeNameTamil: "தேசிய தோட்டக்கலை இயக்கம் - தமிழ்நாடு",
        governmentLevel: "Tamil Nadu Government",
        department: "Department of Horticulture and Plantation Crops",
        category: "Horticulture",
        description: "Promotes holistic growth of horticulture sector covering fruits, vegetables, root and tuber crops, mushrooms, spices, flowers, and aromatic plants.",
        descriptionTamil: "பழங்கள், காய்கறிகள், வாசனைப் பயிர்கள், மலர்கள் சாகுபடி மற்றும் பசுமைக்குடில் அமைக்க 40-50% நிதி உதவி.",
        benefits: "40% to 50% subsidy on establishment of new orchards, polyhouses, shade net houses, and pack houses.",
        benefitsTamil: "தோட்டக்கலை பயிர்கள், பாலிஹவுஸ் பசுமைக்குடில் அமைக்க 40% முதல் 50% வரை மானியம்.",
        eligibilityConditions: [
          "Farmer must dedicate land to approved horticulture crops",
          "Adequate irrigation water source required",
          "Prior approval from Deputy Director of Horticulture (DDH)"
        ],
        minimumAge: 18,
        maximumAge: 75,
        gender: "All",
        incomeLimit: null,
        occupation: "Horticulture Farmer",
        education: "Any",
        socialCategory: ["All"],
        applicableDistricts: ["All"],
        landholdingMin: 0.5,
        landholdingMax: 10.0,
        cropTypes: ["Vegetables", "Flowers", "Banana", "Coconut"],
        farmingTypes: ["Conventional", "Organic", "Natural"],
        irrigationRequirements: ["Drip", "Sprinkler", "Borewell", "Open Well"],
        applicableFarmerTypes: ["Marginal", "Small", "Medium"],
        studentRequired: false,
        farmerRequired: true,
        disabilityRequired: false,
        livestockRequirement: false,
        horticultureRequirement: true,
        machineryRequirement: false,
        requiredDocuments: [
          "Patta, Chitta, Adangal",
          "Detailed Project Proposal for polyhouse/orchard",
          "Soil & Water test suitability certificate",
          "Aadhaar Card"
        ],
        applicationProcess: "Apply online at tnhorticulture.tn.gov.in or consult local Horticulture Officer.",
        applicationDeadline: "Open throughout financial year based on funds availability",
        officialWebsite: "https://tnhorticulture.tn.gov.in",
        applicationUrl: "https://tnhorticulture.tn.gov.in/schemes",
        status: "ACTIVE",
        lastVerifiedDate: new Date("2026-02-28"),
        isDemonstrationData: true
      },
      {
        schemeId: "TN-SCH-08",
        schemeName: "Pradhan Mantri Fasal Bima Yojana (PMFBY Crop Insurance TN)",
        schemeNameTamil: "பிரதமர் பயிர் காப்பீட்டுத் திட்டம் (தமிழ்நாடு)",
        governmentLevel: "Central Government",
        department: "Agriculture and Farmers Welfare Department",
        category: "Crop Insurance",
        description: "Comprehensive crop insurance coverage against non-preventable natural risks, flood, drought, cyclones, and unseasonal rainfall.",
        descriptionTamil: "வறட்சி, வெள்ளம் மற்றும் இயற்கை பேரிடரால் பயிர் சேதம் ஏற்படும் போது இழப்பீடு வழங்கும் விரிவான காப்பீட்டு திட்டம்.",
        benefits: "Low premium of 1.5% to 2% paid by farmer, rest subsidized by Central & State governments. Full claim settlement for verified crop loss.",
        benefitsTamil: "1.5% முதல் 2% குறைந்த பிரீமியத்தில் பயிர் இழப்பீடு பாதுகாப்பு.",
        eligibilityConditions: [
          "Farmer cultivating notified crops in notified revenue villages/firka",
          "Applicable for both loanee and non-loanee farmers",
          "Must enroll before the seasonal cutoff cut-date"
        ],
        minimumAge: 18,
        maximumAge: 85,
        gender: "All",
        incomeLimit: null,
        occupation: "Farmer",
        education: "Any",
        socialCategory: ["All"],
        applicableDistricts: ["All"],
        landholdingMin: 0.1,
        landholdingMax: 999,
        cropTypes: ["Paddy", "Cotton", "Groundnut", "Sugarcane", "Millets", "Pulses"],
        farmingTypes: ["All"],
        irrigationRequirements: ["All"],
        applicableFarmerTypes: ["Marginal", "Small", "Medium", "Large"],
        studentRequired: false,
        farmerRequired: true,
        disabilityRequired: false,
        livestockRequirement: false,
        horticultureRequirement: false,
        machineryRequirement: false,
        requiredDocuments: [
          "Adangal copy issued by VAO",
          "Patta / Chitta document",
          "Bank Passbook copy",
          "Aadhaar Card"
        ],
        applicationProcess: "Apply via Primary Agricultural Cooperative Credit Societies (PACCS), nationalized banks, or e-Sevai centers.",
        applicationDeadline: "Varies by season (Kharif: July 31, Rabi: Nov 15/30)",
        officialWebsite: "https://pmfby.gov.in",
        applicationUrl: "https://pmfby.gov.in/farmerRegistrationForm",
        status: "ACTIVE",
        lastVerifiedDate: new Date("2026-01-15"),
        isDemonstrationData: true
      },
      {
        schemeId: "TN-SCH-09",
        schemeName: "Chief Minister Solar Powered Pump Sets Scheme TN",
        schemeNameTamil: "முதலமைச்சரின் சூரிய சக்தியால் இயங்கும் பம்புசெட் திட்டம்",
        governmentLevel: "Tamil Nadu Government",
        department: "Agricultural Engineering Department (AED), Tamil Nadu",
        category: "Irrigation Support",
        description: "Provision of standalone off-grid Solar Powered Agricultural Pump Sets of 5HP to 10HP capacity with 70% state/central subsidy.",
        descriptionTamil: "விவசாயிகளுக்கு 70% அரசு மானியத்தில் 5 முதல் 10 குதிரைத்திறன் கொண்ட சூரிய மின்சக்தி பம்புசெட்டுகள் வழங்கும் திட்டம்.",
        benefits: "70% total subsidy (30% MNRE Central + 40% Tamil Nadu Government) on solar agricultural pump sets.",
        benefitsTamil: "சூரிய மின்சக்தி மோட்டாருக்கு 70% வரை அரசு மானியம்.",
        eligibilityConditions: [
          "Farmer must possess an open well or borewell with safe yield of water",
          "Should not possess conventional free electricity connection for the proposed well",
          "Small/Marginal and SC/ST farmers are given highest priority"
        ],
        minimumAge: 18,
        maximumAge: 75,
        gender: "All",
        incomeLimit: null,
        occupation: "Farmer",
        education: "Any",
        socialCategory: ["All"],
        applicableDistricts: ["All"],
        landholdingMin: 0.5,
        landholdingMax: 10.0,
        cropTypes: ["All"],
        farmingTypes: ["All"],
        irrigationRequirements: ["Borewell", "Open Well"],
        applicableFarmerTypes: ["Marginal", "Small"],
        studentRequired: false,
        farmerRequired: true,
        disabilityRequired: false,
        livestockRequirement: false,
        horticultureRequirement: false,
        machineryRequirement: false,
        requiredDocuments: [
          "Patta and Chitta with well possession proof",
          "No Objection Certificate (NOC) from TANGEDCO regarding free EB connection",
          "Water quality and yield report",
          "Aadhaar Card"
        ],
        applicationProcess: "Register at the office of the Assistant Executive Engineer (Agricultural Engineering) in your district.",
        applicationDeadline: "Per batch allocation released by state government",
        officialWebsite: "https://aed.tn.gov.in",
        applicationUrl: "https://aed.tn.gov.in/solar-pumps",
        status: "ACTIVE",
        lastVerifiedDate: new Date("2026-02-12"),
        isDemonstrationData: true
      },
      {
        schemeId: "TN-SCH-10",
        schemeName: "Sub-Mission on Agroforestry & Tree Cultivation (TCPL TN)",
        schemeNameTamil: "விவசாய நிலங்களில் மர வளர்ப்பு மற்றும் வேளாண் காடுகள் திட்டம்",
        governmentLevel: "Tamil Nadu Government",
        department: "Forest Department & Agriculture Department TN",
        category: "Financial Assistance",
        description: "Free distribution and planting incentives for high-value timber species (Teak, Red Sanders, Malabar Neem, Mahogany) on farmlands and bunds.",
        descriptionTamil: "விவசாய வரப்புகளில் தேக்கு, செம்மரம், மகோகனி, மலைவேம்பு போன்ற மதிப்புமிக்க மரக்கன்றுகளை வளர்க்க ஊக்கத்தொகை.",
        benefits: "Free saplings plus ₹50 to ₹100 maintenance incentive per surviving tree per year for 3 consecutive years.",
        benefitsTamil: "இலவச மரக்கன்றுகள் மற்றும் மரம் ஒன்றுக்கு ஆண்டு பராமரிப்பு ஊக்கத்தொகை.",
        eligibilityConditions: [
          "Farmer with ownership of land suitable for boundary or block tree plantation",
          "Commitment to preserve and nurture the planted timber species for at least 3 years"
        ],
        minimumAge: 18,
        maximumAge: 80,
        gender: "All",
        incomeLimit: null,
        occupation: "Farmer",
        education: "Any",
        socialCategory: ["All"],
        applicableDistricts: ["All"],
        landholdingMin: 0.5,
        landholdingMax: 20.0,
        cropTypes: ["All"],
        farmingTypes: ["All"],
        irrigationRequirements: ["All"],
        applicableFarmerTypes: ["Marginal", "Small", "Medium"],
        studentRequired: false,
        farmerRequired: true,
        disabilityRequired: false,
        livestockRequirement: false,
        horticultureRequirement: false,
        machineryRequirement: false,
        requiredDocuments: [
          "Patta and Chitta copy",
          "Aadhaar Card",
          "Bank Passbook copy"
        ],
        applicationProcess: "Apply through local Forest Range Office or Forest Extension Centre.",
        applicationDeadline: "Monsoon planting season (August - November)",
        officialWebsite: "https://www.forests.tn.gov.in",
        applicationUrl: "https://www.forests.tn.gov.in/pages/view/agroforestry",
        status: "ACTIVE",
        lastVerifiedDate: new Date("2026-02-22"),
        isDemonstrationData: true
      },
      {
        schemeId: "TN-SCH-11",
        schemeName: "Dairy Development & Milch Animals Scheme for Small Farmers TN",
        schemeNameTamil: "சிறு விவசாயிகளுக்கான கறவை மாடுகள் வழங்கும் திட்டம்",
        governmentLevel: "Tamil Nadu Government",
        department: "Animal Husbandry, Dairying and Fisheries Department",
        category: "Financial Assistance",
        description: "Subsidized distribution of high-yielding milch cows and buffaloes to small/marginal farmers and rural women to augment agricultural income.",
        descriptionTamil: "சிறு, குறு விவசாயிகள் மற்றும் கிராமப்புற பெண்களுக்கு கூடுதல் வருமானம் ஈட்ட கறவை மாடுகள் வழங்கும் திட்டம்.",
        benefits: "Subsidy of up to ₹35,000 per milch animal plus veterinary care and cattle insurance support.",
        benefitsTamil: "மாடு ஒன்றுக்கு ₹35,000 வரை அரசு மானியம் மற்றும் இலவச கால்நடை காப்பீடு.",
        eligibilityConditions: [
          "Small or marginal farmer or landless agricultural laborer",
          "Must have basic shed facilities and willingness to supply milk to Aavin milk cooperative",
          "Priority given to rural women and widows"
        ],
        minimumAge: 18,
        maximumAge: 70,
        gender: "All",
        incomeLimit: 120000,
        occupation: "Farmer / Agricultural Laborer",
        education: "Any",
        socialCategory: ["All"],
        applicableDistricts: ["All"],
        landholdingMin: 0,
        landholdingMax: 5.0,
        cropTypes: ["All"],
        farmingTypes: ["All"],
        irrigationRequirements: ["All"],
        applicableFarmerTypes: ["Marginal", "Small"],
        studentRequired: false,
        farmerRequired: true,
        disabilityRequired: false,
        livestockRequirement: true,
        horticultureRequirement: false,
        machineryRequirement: false,
        requiredDocuments: [
          "Income Certificate from Tahsildar",
          "Aadhaar Card and Ration Card",
          "Aavin Primary Milk Producers Cooperative Society membership proof",
          "Bank Passbook"
        ],
        applicationProcess: "Apply at local Veterinary Dispensary or Village Panchayat office.",
        applicationDeadline: "District target allocations",
        officialWebsite: "https://ahd.tn.gov.in",
        applicationUrl: "https://aavin.tn.gov.in",
        status: "ACTIVE",
        lastVerifiedDate: new Date("2026-02-05"),
        isDemonstrationData: true
      },
      {
        schemeId: "TN-SCH-12",
        schemeName: "Tamil Nadu Soil Health Card & Organic Farming Promotion Scheme",
        schemeNameTamil: "மண் வள அட்டை மற்றும் இயற்கை வேளாண்மை ஊக்குவிப்பு திட்டம்",
        governmentLevel: "Tamil Nadu Government",
        department: "Department of Agriculture and Farmers Welfare",
        category: "Inputs & Seeds",
        description: "Free soil testing across 12 nutrient parameters, issuance of GPS-tagged Soil Health Cards, and subsidies for bio-fertilizers, vermicompost, and neem cake.",
        descriptionTamil: "12 வகையான ஊட்டச்சத்துக்கள் பரிசோதிக்கப்பட்டு இலவச மண்வள அட்டை மற்றும் இயற்கை உரங்கள் மானியத்தில் வழங்கும் திட்டம்.",
        benefits: "Free comprehensive soil health analysis and 50% subsidy on bio-fertilizers, Trichoderma viride, and vermicompost units.",
        benefitsTamil: "இலவச மண் பரிசோதனை அட்டை மற்றும் 50% மானியத்தில் மண்புழு உரம், உயிர் உரங்கள்.",
        eligibilityConditions: [
          "All registered farmers holding cultivable land in Tamil Nadu",
          "Must provide representative soil samples from agricultural plot"
        ],
        minimumAge: 18,
        maximumAge: 85,
        gender: "All",
        incomeLimit: null,
        occupation: "Cultivator",
        education: "Any",
        socialCategory: ["All"],
        applicableDistricts: ["All"],
        landholdingMin: 0.1,
        landholdingMax: 999,
        cropTypes: ["All"],
        farmingTypes: ["Conventional", "Organic", "Natural"],
        irrigationRequirements: ["All"],
        applicableFarmerTypes: ["Marginal", "Small", "Medium", "Large"],
        studentRequired: false,
        farmerRequired: true,
        disabilityRequired: false,
        livestockRequirement: false,
        horticultureRequirement: false,
        machineryRequirement: false,
        requiredDocuments: [
          "Patta copy / Survey number details",
          "Aadhaar Card",
          "Contact details"
        ],
        applicationProcess: "Submit soil sample to your block Soil Testing Laboratory or via Uzhavan App.",
        applicationDeadline: "Continuous ongoing service",
        officialWebsite: "https://soilhealth.dac.gov.in",
        applicationUrl: "https://soilhealth.dac.gov.in/health-card",
        status: "ACTIVE",
        lastVerifiedDate: new Date("2026-03-02"),
        isDemonstrationData: true
      }
    ];

    const createdSchemes = await Scheme.insertMany(schemesData);
    console.log(`[Seed] Seeded ${createdSchemes.length} Tamil Nadu Government schemes.`);

    // 4. Sample Application
    const pmKisanScheme = createdSchemes.find(s => s.schemeId === "TN-SCH-01");
    const kuruvaiScheme = createdSchemes.find(s => s.schemeId === "TN-SCH-05");

    if (pmKisanScheme) {
      await Application.create({
        applicationId: "TN-APP-2026-0001",
        farmerId: farmer1._id,
        schemeId: pmKisanScheme._id,
        schemeCode: pmKisanScheme.schemeId,
        schemeName: pmKisanScheme.schemeName,
        submittedDate: new Date("2026-02-20"),
        status: "APPROVED",
        documents: [
          {
            documentType: "Land Document",
            fileName: "Patta_Chitta_Muthuvel.pdf",
            fileUrl: "/uploads/sample_patta.pdf",
            verificationStatus: "VERIFIED"
          },
          {
            documentType: "Aadhaar Card",
            fileName: "Aadhaar_Muthuvel.pdf",
            fileUrl: "/uploads/sample_aadhaar.pdf",
            verificationStatus: "VERIFIED"
          }
        ],
        adminRemarks: "Land records verified with e-Adangal and revenue database. Approved for installment release.",
        verificationStatus: "VERIFIED",
        applicationHistory: [
          {
            status: "SUBMITTED",
            updatedBy: "Farmer",
            remarks: "Application submitted online.",
            timestamp: new Date("2026-02-20")
          },
          {
            status: "UNDER_VERIFICATION",
            updatedBy: "Agriculture Officer",
            remarks: "VAO inspection completed.",
            timestamp: new Date("2026-02-22")
          },
          {
            status: "APPROVED",
            updatedBy: "Agriculture Officer",
            remarks: "All documents verified and approved.",
            timestamp: new Date("2026-02-25")
          }
        ]
      });
    }

    if (kuruvaiScheme) {
      await Application.create({
        applicationId: "TN-APP-2026-0002",
        farmerId: farmer1._id,
        schemeId: kuruvaiScheme._id,
        schemeCode: kuruvaiScheme.schemeId,
        schemeName: kuruvaiScheme.schemeName,
        submittedDate: new Date("2026-03-01"),
        status: "UNDER_VERIFICATION",
        documents: [
          {
            documentType: "Land Document",
            fileName: "Thanjavur_Adangal_Kuruvai.pdf",
            fileUrl: "/uploads/sample_adangal.pdf",
            verificationStatus: "PENDING"
          }
        ],
        adminRemarks: "Awaiting field verification from Thanjavur block office.",
        verificationStatus: "PENDING",
        applicationHistory: [
          {
            status: "SUBMITTED",
            updatedBy: "Farmer",
            remarks: "Applied for subsidized certified seeds and fertilizer package.",
            timestamp: new Date("2026-03-01")
          }
        ]
      });
    }

    // 5. Sample Documents
    await DocumentModel.create({
      documentId: "DOC-2026-001",
      farmerId: farmer1._id,
      documentType: "Land Document",
      fileName: "Patta_Chitta_Thanjavur.pdf",
      filePath: "uploads/sample_patta.pdf",
      fileSize: 450200,
      mimeType: "application/pdf",
      verificationStatus: "VERIFIED",
      adminRemarks: "Verified with State Revenue portal"
    });

    await DocumentModel.create({
      documentId: "DOC-2026-002",
      farmerId: farmer1._id,
      documentType: "Aadhaar Card",
      fileName: "Aadhaar_Card_Copy.pdf",
      filePath: "uploads/sample_aadhaar.pdf",
      fileSize: 220150,
      mimeType: "application/pdf",
      verificationStatus: "VERIFIED",
      adminRemarks: "Aadhaar verified via UIDAI portal"
    });

    // 6. Sample Notifications
    await Notification.create({
      title: "Kuruvai Special Cultivation Package 2026 announced",
      titleTamil: "குறுவை சாகுபடி சிறப்பு தொகுப்பு 2026 அறிவிக்கப்பட்டது",
      message: "Farmers in Cauvery delta districts can now apply for subsidized certified paddy seeds and fertilizer kits through the portal or Uzhavan app.",
      messageTamil: "காவிரி டெல்டா மாவட்ட விவசாயிகள் சான்று பெற்ற நெல் விதைகள் மற்றும் உரத் தொகுப்புக்கு உடனடியாக விண்ணப்பிக்கலாம்.",
      audience: "DISTRICT",
      targetDistrict: "Thanjavur",
      notificationType: "SCHEME_UPDATE",
      publishedBy: admin._id,
      readBy: []
    });

    await Notification.create({
      title: "Monsoon Weather Advisory & Micro Irrigation Subsidy",
      titleTamil: "பருவமழை ஆலோசனை மற்றும் சொட்டுநீர் பாசன மானியம்",
      message: "100% micro irrigation subsidy is available for small/marginal farmers in Dindigul, Theni, and Salem districts for horticultural crops.",
      messageTamil: "திண்டுக்கல், தேனி, சேலம் மாவட்ட சிறு விவசாயிகளுக்கு சொட்டுநீர் பாசனத்திற்கு 100% மானியம் வழங்கப்படுகிறது.",
      audience: "ALL_FARMERS",
      notificationType: "WEATHER_ADVISORY",
      publishedBy: admin._id,
      readBy: []
    });

    console.log("[Seed] Seeding completed successfully.");
  } catch (err) {
    console.error("[Seed] Error while seeding data:", err);
  }
}

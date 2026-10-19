import { GoogleGenAI } from "@google/genai";

// In-memory cache for fast, repeated translation requests
const translationCache = new Map<string, string>();

// High-accuracy Tamil terminology map for Tamil Nadu agricultural domain
const AGRI_TERMS_TA: Record<string, string> = {
  // Government & Departments
  "Tamil Nadu Government": "தமிழ்நாடு அரசு",
  "Central Government": "மத்திய அரசு",
  "Department of Agriculture": "வேளாண்மைத் துறை",
  "Department of Agriculture and Farmers Welfare": "வேளாண்மை மற்றும் உழவர் நலத்துறை",
  "Department of Horticulture": "தோட்டக்கலைத் துறை",
  "Department of Horticulture and Plantation Crops": "தோட்டக்கலை மற்றும் மலைப்பயிர்கள் துறை",
  "Agricultural Engineering Department": "வேளாண் பொறியியல் துறை",
  "Agricultural Engineering Department, Tamil Nadu": "வேளாண் பொறியியல் துறை, தமிழ்நாடு",
  "Department of Animal Husbandry and Veterinary Services": "கால்நடை பராமரிப்பு மற்றும் மருத்துவப் பணிகள் துறை",
  "Department of Sericulture": "பட்டு வளர்ச்சித் துறை",
  "Department of Fisheries": "மீன்வளத் துறை",

  // Categories
  "Subsidy": "மானியம்",
  "Subsidies": "மானியங்கள்",
  "General Subsidies": "பொது மானியங்கள்",
  "Financial Assistance": "நிதி உதவி",
  "Crop Insurance": "பயிர் காப்பீடு",
  "Irrigation Support": "பாசன ஆதரவு",
  "Machinery Subsidy": "இயந்திர மானியம்",
  "Farm Mechanization": "விவசாய இயந்திரமயமாக்கல்",
  "Horticulture": "தோட்டக்கலை",
  "Inputs & Seeds": "விதைகள் மற்றும் உரங்கள்",
  "Credit / Loan": "கடன் வசதி",
  "Comprehensive Farm Welfare": "ஒருங்கிணைந்த உழவர் நலன்",

  // Farmer & Land Types
  "Small": "சிறு விவசாயி",
  "Marginal": "குறு விவசாயி",
  "Medium": "நடுத்தர விவசாயி",
  "Large": "பெரு விவசாயி",
  "Owned": "சொந்த நிலம்",
  "Leased": "குத்தகை நிலம்",
  "Shared": "பங்கு நிலம்",

  // Crops
  "Paddy": "நெல்",
  "Sugarcane": "கரும்பு",
  "Banana": "வாழை",
  "Coconut": "தென்னை",
  "Cotton": "பருத்தி",
  "Millets": "சிறு தானியங்கள்",
  "Pulses": "பருப்பு வகைகள்",
  "Vegetables": "காய்கறிகள்",
  "Flowers": "மலர்கள்",
  "Groundnut": "நிலக்கடலை",
  "Spices": "மசாலா பயிர்கள்",
  "Oilseeds": "எண்ணெய் வித்துக்கள்",
  "Maize": "மக்காச்சோளம்",
  "Mango": "மாம்பழம்",

  // Irrigation
  "Canal": "வாய்க்கால் பாசனம்",
  "Well": "கிணற்றுப் பாசனம்",
  "Borewell": "ஆழ்துளை கிணறு",
  "Rainfed": "மானாவாரி",
  "Drip": "சொட்டு நீர் பாசனம்",
  "Sprinkler": "தெளிப்பு நீர் பாசனம்",
  "Flood": "பாய்ச்சல் பாசனம்",

  // Status
  "Eligible": "தகுதியானது",
  "Potentially Eligible": "சாத்தியமான தகுதி",
  "Not Eligible": "தகுதியில்லை",
  "Verified": "சரிபார்க்கப்பட்டது",
  "Requires verification": "சரிபார்ப்பு தேவை",
  "Active": "செயலில் உள்ளது",
  "Submitted": "சமர்ப்பிக்கப்பட்டது",
  "Pending Verification": "சரிபார்ப்பில் உள்ளது",
  "Under Field Verification": "கள ஆய்வில் உள்ளது",
  "Approved": "ஒப்புதல் அளிக்கப்பட்டது",
  "Rejected": "நிராகரிக்கப்பட்டது",
  "Ongoing": "தொடர்ந்து நடைமுறையில்",

  // Key criteria phrases
  "Aadhaar Card": "ஆதார் அட்டை",
  "Patta / Chitta": "பட்டா / சிட்டா (நில உரிமை ஆவணம்)",
  "Patta / Chitta (Land Ownership Record)": "பட்டா / சிட்டா (நில உரிமை ஆவணம்)",
  "Bank Passbook (Aadhaar linked)": "வங்கி கணக்குப் புத்தகம் (ஆதார் இணைக்கப்பட்டது)",
  "Active Mobile Number": "செயலில் உள்ள கைபேசி எண்",
  "Community / Caste Certificate": "சாதி / சமூக சான்றிதழ்",
  "BPL / Ration Card": "குடும்ப அட்டை / ரேஷன் கார்டு",
  "Passport Size Photo": "பாஸ்போர்ட் அளவு புகைப்படம்",
  "Water & Soil Test Report": "மண் மற்றும் நீர் பரிசோதனை அறிக்கை",
  "FMB Sketch": "புல வரைபடம் (FMB Sketch)",
  "Small/Marginal Farmer Certificate": "சிறு / குறு விவசாயி சான்றிதழ்",

  // Extended phrases
  "Paddy cultivation subsidy": "நெல் சாகுபடி மானியம்",
  "Marginal farmer": "குறு விவசாயி",
  "Small farmer": "சிறு விவசாயி",
  "Small and Marginal Farmers": "சிறு மற்றும் குறு விவசாயிகள்",
  "Borewell with submersible pump": "நீர்மூழ்கி பம்புடன்கூடிய ஆழ்துளை கிணறு",
  "Drip irrigation equipment subsidy for horticulture crops": "தோட்டக்கலை பயிர்களுக்கான சொட்டுநீர் பாசன உபகரண மானியம்",
  "Eligible for Small and Marginal Farmers": "சிறு மற்றும் குறு விவசாயிகளுக்கு தகுதியானது",
  "Central Government scheme for small farmers": "சிறு விவசாயிகளுக்கான மத்திய அரசு திட்டம்",
  "Annual Income Limit": "ஆண்டு வருமான வரம்பு",
  "Cultivable Land": "பயிரிடக்கூடிய நிலம்",
  "Acres": "ஏக்கர்",
  "Direct Benefit Transfer": "நேரடி பயன் பரிமாற்றம் (DBT)"
};

// Word-level replacement for robust fallbacks
const WORD_DICT_TA: Record<string, string> = {
  "cultivation": "சாகுபடி",
  "subsidy": "மானியம்",
  "subsidies": "மானியங்கள்",
  "scheme": "திட்டம்",
  "schemes": "திட்டங்கள்",
  "farmer": "விவசாயி",
  "farmers": "விவசாயிகள்",
  "marginal": "குறு",
  "small": "சிறு",
  "irrigation": "பாசனம்",
  "drip": "சொட்டு நீர்",
  "sprinkler": "தெளிப்பு நீர்",
  "borewell": "ஆழ்துளை கிணறு",
  "eligible": "தகுதியானது",
  "ineligible": "தகுதியற்றது",
  "acres": "ஏக்கர்",
  "acre": "ஏக்கர்",
  "land": "நிலம்",
  "crop": "பயிர்",
  "crops": "பயிர்கள்",
  "assistance": "உதவி",
  "benefit": "பயன்",
  "benefits": "பயன்கள்",
  "government": "அரசு",
  "central": "மத்திய",
  "state": "மாநில",
  "department": "துறை",
  "paddy": "நெல்",
  "organic": "இயற்கை",
  "farming": "விவசாயம்",
  "insurance": "காப்பீடு",
  "loan": "கடன்",
  "credit": "கடன்",
  "water": "நீர்",
  "soil": "மண்",
  "tractor": "டிராக்டர்",
  "seeds": "விதைகள்",
  "fertilizer": "உரம்"
};

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey.includes("leaked")) {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn("[Gemini Service] Initialization failed:", err);
    return null;
  }
}

/**
 * Translates English text to Tamil or vice versa.
 * Uses Gemini API with fallback to built-in agricultural dictionary.
 */
export async function translateContent(
  text: string,
  targetLang: "ta" | "en" = "ta"
): Promise<string> {
  if (!text || typeof text !== "string" || !text.trim()) {
    return text;
  }

  const trimmed = text.trim();

  // If target is English and input is already ASCII text
  if (targetLang === "en" && /^[\x00-\x7F]+$/.test(trimmed)) {
    return trimmed;
  }

  // Check static agricultural terminology lookup
  if (targetLang === "ta" && AGRI_TERMS_TA[trimmed]) {
    return AGRI_TERMS_TA[trimmed];
  }

  // Case-insensitive static lookup
  if (targetLang === "ta") {
    const matchedKey = Object.keys(AGRI_TERMS_TA).find(
      (k) => k.toLowerCase() === trimmed.toLowerCase()
    );
    if (matchedKey) {
      return AGRI_TERMS_TA[matchedKey];
    }
  }

  // Check cache
  const cacheKey = `${targetLang}:${trimmed}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  // Check if AI Gemini API client is available
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = targetLang === "ta"
        ? `You are an expert Tamil translator for the Tamil Nadu Government Agriculture Department.
Translate the following English text accurately and naturally into Tamil.
Preserve numbers, currency symbols (₹), acre measurements, and technical names where appropriate.
Return ONLY the direct Tamil translation without any quotation marks, markdown headings, or conversational preface:

${trimmed}`
        : `Translate the following Tamil text into clear, professional English.
Return ONLY the direct English translation without any quotation marks or extra text:

${trimmed}`;

      // Try modern Gemini models
      const modelsToTry = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash"];
      let resultText = "";

      for (const model of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt
          });
          if (response && response.text) {
            resultText = response.text.trim();
            break;
          }
        } catch {
          // continue to next model
        }
      }

      if (resultText) {
        translationCache.set(cacheKey, resultText);
        return resultText;
      }
    } catch (err) {
      console.warn("[Gemini Translation Error]:", (err as any)?.message);
    }
  }

  // If Gemini is not configured or failed, apply rule-based phrase substitution for known patterns
  if (targetLang === "ta") {
    let fallback = trimmed;

    // Common reason pattern translations
    fallback = fallback
      .replace(/Farmer age \((\d+) years\) satisfies verified minimum requirement of (\d+) years/gi, 
        "விவசாயியின் வயது ($1 ஆண்டுகள்) அனுமதிக்கப்பட்ட குறைந்தபட்ச வயதான $2 ஆண்டுகளை பூர்த்தி செய்கிறது")
      .replace(/Farmer age \((\d+) years\) is within verified maximum limit of (\d+) years/gi, 
        "விவசாயியின் வயது ($1 ஆண்டுகள்) திட்டத்தின் அதிகபட்ச வரம்பான $2 ஆண்டுகளுக்குள் உள்ளது")
      .replace(/Annual income \(₹([^)]+)\) is within the verified ceiling of ₹([^)]+)/gi, 
        "ஆண்டு குடும்ப வருமானம் (₹$1) அனுமதிக்கப்பட்ட உச்ச வரம்பான ₹$2-க்குள் உள்ளது")
      .replace(/Annual household income \(₹([^)]+)\) exceeds the verified scheme ceiling of ₹([^)]+)/gi, 
        "ஆண்டு குடும்ப வருமானம் (₹$1) திட்டத்தின் அதிகபட்ச உச்ச வரம்பான ₹$2-ஐ விட அதிகமாக உள்ளது")
      .replace(/Landholding of ([\d.]+) Acres meets verified ([\d.]+)-([\d.]+) Acre requirement/gi, 
        "$1 ஏக்கர் நிலப்பரப்பு இத்திட்டத்தின் $2 முதல் $3 ஏக்கர் தகுதி வரம்பிற்குள் உள்ளது")
      .replace(/Landholding of ([\d.]+) Acres meets verified ([\d.]+)- requirement/gi, 
        "$1 ஏக்கர் நிலப்பரப்பு திட்டத்தின் குறைந்தபட்ச $2 ஏக்கர் தகுதியை பூர்த்தி செய்கிறது")
      .replace(/Your landholding \(([\d.]+) Acres\) exceeds the maximum limit of ([\d.]+) Acres for this scheme\./gi, 
        "உங்கள் நிலப்பரப்பு ($1 ஏக்கர்) இத்திட்டத்தின் அதிகபட்ச வரம்பான $2 ஏக்கரை விட அதிகமாக உள்ளது.")
      .replace(/Applicable for cultivated crop: (.*)/gi, (_, crop) => `பயிரிடப்படும் பயிருக்கான திட்டம்: ${AGRI_TERMS_TA[crop] || crop}`)
      .replace(/Applicable in designated district: (.*)/gi, "தேர்ந்தெடுக்கப்பட்ட மாவட்டத்தில் செயல்படுத்தப்படும் திட்டம்: $1")
      .replace(/Category match: (.*) farmer/gi, (_, ftype) => `பிரிவு பொருத்தம்: ${AGRI_TERMS_TA[ftype] || ftype} விவசாயி`)
      .replace(/Recommended for: (.*)/gi, "பரிந்துரைக்கப்படும் பலன்: $1")
      .replace(/General state agricultural welfare eligibility/gi, "பொதுவான மாநில வேளாண் நலத்திட்ட தகுதி")
      .replace(/Special Welfare Status: 5% Differently-Abled priority quota applied/gi, "சிறப்பு சலுகை: மாற்றுத்திறனாளிகளுக்கான 5% முன்னுரிமை ஒதுக்கீடு பொருந்தும்")
      .replace(/Matches micro-irrigation \/ drip equipment subsidy criteria/gi, "சொட்டுநீர் பாசன மானிய தகுதி விதிகளுடன் பொருந்துகிறது")
      .replace(/Priority candidate for 70% Solar Agricultural Pumpset subsidy \(PM-KUSUM\)/gi, "70% சூரிய ஒளி பம்ப்செட் மானியத்திற்கு (PM-KUSUM) தகுதி வாய்ந்தது")
      .replace(/Scheme requires ownership of farm implements or tractor\/power tiller\./gi, "இத்திட்டத்திற்கு டிராக்டர் அல்லது விவசாய கருவிகள் உரிமை தேவை.")
      .replace(/Scheme is specific to crops: (.*) \(your crops: (.*)\)\./gi, "இத்திட்டம் குறிப்பிட்ட பயிர்களுக்கு மட்டுமே பொருந்தும்: $1 (உங்கள் பயிர்: $2).");

    // If fallback didn't change and contains multiple recognizable agricultural words, perform word replacement
    if (fallback === trimmed) {
      let replaced = trimmed;
      for (const [w, ta] of Object.entries(WORD_DICT_TA)) {
        const regex = new RegExp(`\\b${w}\\b`, "gi");
        replaced = replaced.replace(regex, ta);
      }
      if (replaced !== trimmed) {
        fallback = replaced;
      }
    }

    translationCache.set(cacheKey, fallback);
    return fallback;
  }

  return trimmed;
}

/**
 * Batch translation of an array of texts
 */
export async function batchTranslateContent(
  texts: string[],
  targetLang: "ta" | "en" = "ta"
): Promise<string[]> {
  const promises = texts.map((t) => translateContent(t, targetLang));
  return Promise.all(promises);
}

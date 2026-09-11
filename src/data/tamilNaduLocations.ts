export interface TNVillage {
  id: string;
  name: string;
  nameTamil?: string;
}

export interface TNBlock {
  id: string;
  name: string;
  nameTamil?: string;
  villages: string[];
}

export interface TNDistrict {
  id: string;
  name: string;
  nameTamil: string;
  blocks: TNBlock[];
}

export const TAMIL_NADU_LOCATIONS: TNDistrict[] = [
  {
    id: "thanjavur",
    name: "Thanjavur",
    nameTamil: "தஞ்சாவூர்",
    blocks: [
      {
        id: "thanjavur_block",
        name: "Thanjavur",
        nameTamil: "தஞ்சாவூர்",
        villages: ["Kandiyur", "Manakarambai", "Nanjikottai", "Pillaiyarpatti", "Vallam", "Vallampudur", "Vilar"]
      },
      {
        id: "kumbakonam",
        name: "Kumbakonam",
        nameTamil: "கும்பகோணம்",
        villages: ["Ammanpettai", "Asur", "Darashuram", "Koranattu", "Sakkottai", "Ullur"]
      },
      {
        id: "orathanadu",
        name: "Orathanadu",
        nameTamil: "ஒரத்தநாடு",
        villages: ["Alivoikkal", "Kannanthankudi", "Mullurpattikadu", "Pudur", "Thekkur"]
      },
      {
        id: "papanasam",
        name: "Papanasam",
        nameTamil: "பாபநாசம்",
        villages: ["Alavandipuram", "Kalyanapuram", "Melattur", "Rajagiri", "Thirukkarugavur"]
      },
      {
        id: "pattukkottai",
        name: "Pattukkottai",
        nameTamil: "பட்டுக்கோட்டை",
        villages: ["Enathi", "Kalyanaodai", "Mallipattinam", "Nattusalai", "Thambikottai"]
      },
      {
        id: "thiruvaiyaru",
        name: "Thiruvaiyaru",
        nameTamil: "திருவையாறு",
        villages: ["Allur", "Kaduveli", "Karuppur", "Marur", "Thillaisthanam", "Vaidyanathanpettai"]
      }
    ]
  },
  {
    id: "madurai",
    name: "Madurai",
    nameTamil: "மதுரை",
    blocks: [
      {
        id: "madurai_east",
        name: "Madurai East",
        nameTamil: "மதுரை கிழக்கு",
        villages: ["Appanthirupathi", "Kallandiri", "Othakadai", "Pancheri", "Varichiyur"]
      },
      {
        id: "madurai_west",
        name: "Madurai West",
        nameTamil: "மதுரை மேற்கு",
        villages: ["Chatrapatti", "Kovilpappakudi", "Paravai", "Samayanallur", "Siruvalai"]
      },
      {
        id: "melur",
        name: "Melur",
        nameTamil: "மேலூர்",
        villages: ["Attukulam", "Keelavalavu", "Kidaripatti", "Navinipatti", "Vellalore"]
      },
      {
        id: "vadipatti",
        name: "Vadipatti",
        nameTamil: "வாடிப்பட்டி",
        villages: ["Alanganallur", "Katchakatti", "Mullipallam", "Palamedu", "Thathaneri"]
      },
      {
        id: "usilampatti",
        name: "Usilampatti",
        nameTamil: "உசிலம்பட்டி",
        villages: ["Alligundam", "Dodappanaickanur", "Nakkalapatti", "Uthappanaickanur", "Vallaripatti"]
      }
    ]
  },
  {
    id: "coimbatore",
    name: "Coimbatore",
    nameTamil: "கோயம்புத்தூர்",
    blocks: [
      {
        id: "pollachi_north",
        name: "Pollachi North",
        nameTamil: "பொள்ளாச்சி வடக்கு",
        villages: ["Achipatti", "Devambadi", "Nallur", "Puravipalayam", "Ramapattinam"]
      },
      {
        id: "pollachi_south",
        name: "Pollachi South",
        nameTamil: "பொள்ளாச்சி தெற்கு",
        villages: ["Gomangalampudur", "Makkinampatti", "Samathur", "Singanallur", "Suleeswaranpatti"]
      },
      {
        id: "thondamuthur",
        name: "Thondamuthur",
        nameTamil: "தொண்டாமுத்தூர்",
        villages: ["Boluvampatti", "Devarayapuram", "Ikkarai Boluvampatti", "Narasipuram", "Vellimalaipattinam"]
      },
      {
        id: "karamadai",
        name: "Karamadai",
        nameTamil: "காரமடை",
        villages: ["Bellepalayam", "Chikkarampalayam", "Kallipalayam", "Marudur", "Thekkampatti"]
      },
      {
        id: "sulur",
        name: "Sulur",
        nameTamil: "சூலூர்",
        villages: ["Arasur", "Kaniyur", "Muthugoundenpudur", "Rasipalayam", "Semmandampalayam"]
      }
    ]
  },
  {
    id: "salem",
    name: "Salem",
    nameTamil: "சேலம்",
    blocks: [
      {
        id: "attur",
        name: "Attur",
        nameTamil: "ஆத்தூர்",
        villages: ["Kothampadi", "Manjini", "Pethanaickenpalayam", "Thennankudipalayam", "Valapady"]
      },
      {
        id: "omalur",
        name: "Omalur",
        nameTamil: "ஓமலூர்",
        villages: ["Kamalapuram", "Karuppur", "Pagalpatti", "Sikkampatty", "Tholasampatti"]
      },
      {
        id: "mettur",
        name: "Mettur",
        nameTamil: "மேட்டூர்",
        villages: ["Gonur", "Koonandiyur", "Navappatti", "Pannavadi", "Thangamapuripattinam"]
      },
      {
        id: "sankari",
        name: "Sankari",
        nameTamil: "சங்ககிரி",
        villages: ["Alathur", "Chinnagoundanur", "Irugalur", "Kaveripatti", "Vellarivelli"]
      }
    ]
  },
  {
    id: "tiruchirappalli",
    name: "Tiruchirappalli",
    nameTamil: "திருச்சிராப்பள்ளி",
    blocks: [
      {
        id: "lalgudi",
        name: "Lalgudi",
        nameTamil: "லால்குடி",
        villages: ["Anbil", "Jangamarajapuram", "Manakkal", "Poovalur", "Sembarai"]
      },
      {
        id: "musiri",
        name: "Musiri",
        nameTamil: "முசிறி",
        villages: ["Gunaseelam", "Kattuputhur", "Moovanur", "Thinnakonam", "Vellur"]
      },
      {
        id: "manachanallur",
        name: "Manachanallur",
        nameTamil: "மண்ணச்சநல்லூர்",
        villages: ["Edumalai", "Poonampalayam", "Samayapuram", "Siruganur", "Valadi"]
      },
      {
        id: "srirangam",
        name: "Srirangam",
        nameTamil: "ஸ்ரீரங்கம்",
        villages: ["Andanallur", "Kallanai", "Kulumani", "Mekudi", "Pettavaithalai"]
      }
    ]
  },
  {
    id: "tirunelveli",
    name: "Tirunelveli",
    nameTamil: "திருநெல்வேலி",
    blocks: [
      {
        id: "ambasamudram",
        name: "Ambasamudram",
        nameTamil: "அம்பாசமுத்திரம்",
        villages: ["Brahmadesam", "Kallidaikurichi", "Manimuthar", "Singampatti", "Vickramasingapuram"]
      },
      {
        id: "palayamkottai",
        name: "Palayamkottai",
        nameTamil: "பாளையங்கோட்டை",
        villages: ["Karisalpatti", "Melapattam", "Munnirpallam", "Reddiarpatti", "Thidanur"]
      },
      {
        id: "radhapuram",
        name: "Radhapuram",
        nameTamil: "ராதாபுரம்",
        villages: ["Idindakarai", "Kallikulam", "Koodankulam", "Panagudi", "Vallioor"]
      }
    ]
  },
  {
    id: "dindigul",
    name: "Dindigul",
    nameTamil: "திண்டுக்கல்",
    blocks: [
      {
        id: "athoor",
        name: "Athoor",
        nameTamil: "ஆத்தூர்",
        villages: ["Ayyampalayam", "Bodikoundanpatti", "Chinnalapatti", "Pillayarnatham", "Sithayankottai"]
      },
      {
        id: "palani",
        name: "Palani",
        nameTamil: "பழனி",
        villages: ["Ayakudi", "Balasamudram", "Neikarapatti", "Pappampatti", "Thalawaipatti"]
      },
      {
        id: "nilakottai",
        name: "Nilakottai",
        nameTamil: "நிலக்கோட்டை",
        villages: ["Batlagundu", "Mallanampatti", "Nariyuthu", "Sillukuvarpatti", "Vilampatti"]
      }
    ]
  },
  {
    id: "cuddalore",
    name: "Cuddalore",
    nameTamil: "கடலூர்",
    blocks: [
      {
        id: "panruti",
        name: "Panruti",
        nameTamil: "பண்ருட்டி",
        villages: ["Kandarakottai", "Marungur", "Semakottai", "Thiruvathigai", "Veeraperumanallur"]
      },
      {
        id: "chidambaram",
        name: "Chidambaram",
        nameTamil: "சிதம்பரம்",
        villages: ["Bhuvanagiri", "Keerapalayam", "Kothattai", "Parangipettai", "Pitchavaram"]
      },
      {
        id: "vriddhachalam",
        name: "Vriddhachalam",
        nameTamil: "விருத்தாசலம்",
        villages: ["Karnatham", "Mangalampettai", "Pennadam", "Thoravalur", "Vennangur"]
      }
    ]
  },
  {
    id: "erode",
    name: "Erode",
    nameTamil: "ஈரோடு",
    blocks: [
      {
        id: "gobichettipalayam",
        name: "Gobichettipalayam",
        nameTamil: "கோபிசெட்டிபாளையம்",
        villages: ["Alukuli", "Kallipatti", "Kottupullampalayam", "Pariyur", "Vellankoil"]
      },
      {
        id: "bhavani",
        name: "Bhavani",
        nameTamil: "பவானி",
        villages: ["Ammapettai", "Appakudal", "Jambai", "Oricheri", "Periyapuliyur"]
      },
      {
        id: "perundurai",
        name: "Perundurai",
        nameTamil: "பெருந்துறை",
        villages: ["Chennimalai", "Kunnathur", "Moongilpalayam", "Pethampalayam", "Vijayamangalam"]
      }
    ]
  },
  {
    id: "dharmapuri",
    name: "Dharmapuri",
    nameTamil: "தர்மபுரி",
    blocks: [
      {
        id: "palacode",
        name: "Palacode",
        nameTamil: "பாலக்கோடு",
        villages: ["Belarahalli", "Gummanur", "Karagur", "Marandahalli", "Samichettipatti"]
      },
      {
        id: "pennagaram",
        name: "Pennagaram",
        nameTamil: "பென்னாகரம்",
        villages: ["Hogenakkal", "Kogilkal", "Manjanayakkanahalli", "Pikkili", "Sunjalnatham"]
      },
      {
        id: "harur",
        name: "Harur",
        nameTamil: "அரூர்",
        villages: ["Dodampatti", "Ellapudayampatti", "Kokkarapatti", "Naripalli", "Theerthamalai"]
      }
    ]
  },
  {
    id: "nagapattinam",
    name: "Nagapattinam",
    nameTamil: "நாகப்பட்டினம்",
    blocks: [
      {
        id: "kilvelur",
        name: "Kilvelur",
        nameTamil: "கீழ்வேளூர்",
        villages: ["Akkarapettai", "Ananthagudivellur", "Kurukkathi", "Radhamangalam", "Thevur"]
      },
      {
        id: "vedaranyam",
        name: "Vedaranyam",
        nameTamil: "வேதாரண்யம்",
        villages: ["Ayakkaranpulam", "Kodiyakarai", "Kodiakkadu", "Thalainayar", "Voimedu"]
      }
    ]
  },
  {
    id: "tiruvarur",
    name: "Tiruvarur",
    nameTamil: "திருவாரூர்",
    blocks: [
      {
        id: "mannargudi",
        name: "Mannargudi",
        nameTamil: "மன்னார்குடி",
        villages: ["Asuvur", "Edamelaiyur", "Kottur", "Neduvakkottai", "Ullikkottai"]
      },
      {
        id: "nannilam",
        name: "Nannilam",
        nameTamil: "நன்னிலம்",
        villages: ["Achuthamangalam", "Kollumangudi", "Peralam", "Poonthottam", "Srivanjiyam"]
      }
    ]
  },
  {
    id: "ramanathapuram",
    name: "Ramanathapuram",
    nameTamil: "ராமநாதபுரம்",
    blocks: [
      {
        id: "paramakudi",
        name: "Paramakudi",
        nameTamil: "பரமக்குடி",
        villages: ["Bogalur", "Emaneswaram", "Nainarkoil", "Pambur", "Venkitankurichi"]
      },
      {
        id: "tiruvadanai",
        name: "Tiruvadanai",
        nameTamil: "திருவாடானை",
        villages: ["Devipattinam", "R.S. Mangalam", "Thirupalakudi", "Uppur", "Vattanam"]
      }
    ]
  },
  {
    id: "virudhunagar",
    name: "Virudhunagar",
    nameTamil: "விருதுநகர்",
    blocks: [
      {
        id: "srivilliputhur",
        name: "Srivilliputhur",
        nameTamil: "ஸ்ரீவில்லிபுத்தூர்",
        villages: ["Inam Karisalkulam", "Malliputhur", "Mamsapuram", "Pillayarkulam", "Watrap"]
      },
      {
        id: "rajapalayam",
        name: "Rajapalayam",
        nameTamil: "ராஜபாளையம்",
        villages: ["Chettiyarpatti", "Dalavaipuram", "Kombanai", "Seithur", "Thalavaipuram"]
      }
    ]
  },
  {
    id: "kallakurichi",
    name: "Kallakurichi",
    nameTamil: "கள்ளக்குறிச்சி",
    blocks: [
      {
        id: "sankarapuram",
        name: "Sankarapuram",
        nameTamil: "சங்கராபுரம்",
        villages: ["Devapandalam", "Moongilthuraipattu", "Pudupattu", "Rishivandiyam", "Vadasiruvalur"]
      },
      {
        id: "ulundurpet",
        name: "Ulundurpet",
        nameTamil: "உளுந்தூர்பேட்டை",
        villages: ["Asanur", "Elavanasurkottai", "Kalamarudur", "Mangalampettai", "Padur"]
      }
    ]
  },
  {
    id: "tenkasi",
    name: "Tenkasi",
    nameTamil: "தென்காசி",
    blocks: [
      {
        id: "sankarankovil",
        name: "Sankarankovil",
        nameTamil: "சங்கரன்கோவில்",
        villages: ["Karivalamvandanallur", "Perumpattur", "Sendamangalam", "Thalavaipuram", "Vannikonenthal"]
      },
      {
        id: "kadayanallur",
        name: "Kadayanallur",
        nameTamil: "கடையநல்லூர்",
        villages: ["Chockampatti", "Idaikal", "Kambaneri", "Mavanna", "Poyigai"]
      }
    ]
  }
];

// Fallback generator for other TN districts so every district has blocks and villages
export const ALL_TN_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

export function getBlocksForDistrict(districtName: string): TNBlock[] {
  const found = TAMIL_NADU_LOCATIONS.find(
    (d) => d.name.toLowerCase() === districtName.toLowerCase()
  );
  if (found && found.blocks.length > 0) {
    return found.blocks;
  }
  // Standard administrative block fallback for any remaining district
  return [
    {
      id: `${districtName.toLowerCase().replace(/\s+/g, "_")}_north`,
      name: `${districtName} North`,
      villages: [`${districtName} Rural East`, `${districtName} Rural West`, "Kaveripudur", "Mettupalayam"]
    },
    {
      id: `${districtName.toLowerCase().replace(/\s+/g, "_")}_south`,
      name: `${districtName} South`,
      villages: [`${districtName} Agro Centre`, "Kallupatti", "Pancheri", "Thottakadu"]
    },
    {
      id: `${districtName.toLowerCase().replace(/\s+/g, "_")}_central`,
      name: `${districtName} Central`,
      villages: ["Alathur", "Keelamangalam", "Melapatti", "Pillaiyarkulam"]
    }
  ];
}

export function getVillagesForBlock(districtName: string, blockName: string): string[] {
  const blocks = getBlocksForDistrict(districtName);
  const matched = blocks.find(
    (b) => b.name.toLowerCase() === blockName.toLowerCase() || b.id === blockName
  );
  if (matched && matched.villages.length > 0) {
    return matched.villages;
  }
  return ["Gramam 1", "Gramam 2", "Agri Zone Village", "West Hamlet"];
}

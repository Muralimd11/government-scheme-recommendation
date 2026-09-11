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
        villages: ["Kandiyur", "Manakarambai", "Nanjikottai", "Pillaiyarpatti", "Vallam", "Vallampudur", "Vilar"]
      },
      {
        id: "kumbakonam",
        name: "Kumbakonam",
        villages: ["Ammanpettai", "Asur", "Darashuram", "Koranattu", "Sakkottai", "Ullur"]
      },
      {
        id: "orathanadu",
        name: "Orathanadu",
        villages: ["Alivoikkal", "Kannanthankudi", "Mullurpattikadu", "Pudur", "Thekkur"]
      },
      {
        id: "papanasam",
        name: "Papanasam",
        villages: ["Alavandipuram", "Kalyanapuram", "Melattur", "Rajagiri", "Thirukkarugavur"]
      },
      {
        id: "pattukkottai",
        name: "Pattukkottai",
        villages: ["Enathi", "Kalyanaodai", "Mallipattinam", "Nattusalai", "Thambikottai"]
      },
      {
        id: "thiruvaiyaru",
        name: "Thiruvaiyaru",
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
        villages: ["Appanthirupathi", "Kallandiri", "Othakadai", "Pancheri", "Varichiyur"]
      },
      {
        id: "madurai_west",
        name: "Madurai West",
        villages: ["Chatrapatti", "Kovilpappakudi", "Paravai", "Samayanallur", "Siruvalai"]
      },
      {
        id: "melur",
        name: "Melur",
        villages: ["Attukulam", "Keelavalavu", "Kidaripatti", "Navinipatti", "Vellalore"]
      },
      {
        id: "vadipatti",
        name: "Vadipatti",
        villages: ["Alanganallur", "Katchakatti", "Mullipallam", "Palamedu", "Thathaneri"]
      },
      {
        id: "usilampatti",
        name: "Usilampatti",
        villages: ["Alligundam", "Dodappanaickanur", "Nakkalapatti", "Uthappanaickanur", "Vallaripatti"]
      }
    ]
  }
];

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

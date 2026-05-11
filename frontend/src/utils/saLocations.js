// ── South African Provinces and Cities ──
// Source: Stats SA (Statistics South Africa) — statssa.gov.za
// All 9 official provinces as defined by the Constitution of South Africa

export const PROVINCES = [
    "Eastern Cape",
    "Free State",
    "Gauteng",
    "KwaZulu-Natal",
    "Limpopo",
    "Mpumalanga",
    "North West",
    "Northern Cape",
    "Western Cape",
];

export const CITIES_BY_PROVINCE = {
    "Eastern Cape": ["East London", "Port Elizabeth (Gqeberha)", "Mthatha", "Queenstown", "Grahamstown (Makhanda)", "King William's Town", "Bhisho"],
    "Free State": ["Bloemfontein", "Welkom", "Bethlehem", "Kroonstad", "Phuthaditjhaba", "Sasolburg"],
    "Gauteng": ["Johannesburg", "Pretoria (Tshwane)", "Ekurhuleni", "Sandton", "Soweto", "Centurion", "Midrand", "Randburg", "Roodepoort", "Germiston"],
    "KwaZulu-Natal": ["Durban (eThekwini)", "Pietermaritzburg", "Richards Bay", "Newcastle", "Ballito", "Umhlanga", "Ladysmith"],
    "Limpopo": ["Polokwane", "Tzaneen", "Thohoyandou", "Mokopane", "Bela-Bela", "Giyani"],
    "Mpumalanga": ["Mbombela (Nelspruit)", "Witbank (eMalahleni)", "Secunda", "Standerton", "Middelburg"],
    "North West": ["Rustenburg", "Mahikeng", "Klerksdorp", "Potchefstroom", "Brits"],
    "Northern Cape": ["Kimberley", "Upington", "Springbok", "De Aar", "Kuruman"],
    "Western Cape": ["Cape Town", "George", "Stellenbosch", "Paarl", "Worcester", "Knysna", "Mossel Bay"],
};

// Flat list of all cities for simple dropdowns
export const ALL_CITIES = Object.values(CITIES_BY_PROVINCE).flat().sort();
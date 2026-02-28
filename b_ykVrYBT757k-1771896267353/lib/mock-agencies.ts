export interface MockAgency {
    id: string
    name: string
    address: string
    city: string
    lat: number
    lng: number
    phone?: string
}

// Some sample locations in major Moroccan cities
export const mockAgenciesData: MockAgency[] = [
    // Casablanca
    { id: "c1", name: "Premium Cars Casa", address: "15 Boulevard Anfa", city: "Casablanca", lat: 33.5931, lng: -7.6398, phone: "+212 522 123 456" },
    { id: "c2", name: "Casa Auto Location", address: "42 Rue Zerktouni", city: "Casablanca", lat: 33.5831, lng: -7.6298, phone: "+212 522 654 321" },
    { id: "c3", name: "Speedy Rent", address: "Aéroport Mohammed V", city: "Casablanca", lat: 33.3675, lng: -7.5898, phone: "+212 522 987 654" },
    { id: "c4", name: "Medina Motors", address: "Place des Nations Unies", city: "Casablanca", lat: 33.5951, lng: -7.6188, phone: "+212 522 111 222" },

    // Rabat
    { id: "r1", name: "Capital Rent", address: "10 Avenue Hassan II", city: "Rabat", lat: 34.0209, lng: -6.8416, phone: "+212 537 123 456" },
    { id: "r2", name: "Rabat Drive", address: "Quartier Agdal", city: "Rabat", lat: 34.0009, lng: -6.8516 },
    { id: "r3", name: "Royal Cars", address: "Aéroport Rabat-Salé", city: "Rabat", lat: 34.0390, lng: -6.7516, phone: "+212 537 999 888" },

    // Marrakech
    { id: "m1", name: "Atlas Wheels", address: "Gueliz", city: "Marrakech", lat: 31.6395, lng: -8.0111, phone: "+212 524 123 456" },
    { id: "m2", name: "Marrakech Auto", address: "Aéroport Menara", city: "Marrakech", lat: 31.6069, lng: -8.0363, phone: "+212 524 456 789" },
    { id: "m3", name: "Palm Rent a Car", address: "Avenue Mohammed VI", city: "Marrakech", lat: 31.6195, lng: -8.0011 },

    // Tangier
    { id: "t1", name: "Tanger Locations", address: "Boulevard Pasteur", city: "Tangier", lat: 35.7695, lng: -5.8130, phone: "+212 539 123 456" },
    { id: "t2", name: "North Coast Drive", address: "Aéroport Ibn Batouta", city: "Tangier", lat: 35.7269, lng: -5.9169 },

    // Agadir
    { id: "a1", name: "Souss Rent", address: "Secteur Touristique", city: "Agadir", lat: 30.4078, lng: -9.6081, phone: "+212 528 123 456" },
    { id: "a2", name: "Agadir Cars", address: "Centre Ville", city: "Agadir", lat: 30.4278, lng: -9.5981 },

    // Fes
    { id: "f1", name: "Fes Auto", address: "Ville Nouvelle", city: "Fes", lat: 34.0333, lng: -5.0000, phone: "+212 535 123 456" },
    { id: "f2", name: "Imperial Drive", address: "Aéroport Fès-Saïs", city: "Fes", lat: 33.9273, lng: -4.9779 },
]

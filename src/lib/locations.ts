// Authentic MUST (Mbeya University of Science and Technology) campus + nearby areas.
export const MUST_LOCATIONS = [
  // On campus
  "Hostel 6a",
  "Hostel 6b",
  "New Hostels",
  "Academic Blocks",
  "Library",
  // Off campus (where ~70% of students live)
  "Iyunga",
  "Ikuti",
  "Inyara",
  "Lupeta",
  "Coca",
] as const;

export type MustLocation = (typeof MUST_LOCATIONS)[number];

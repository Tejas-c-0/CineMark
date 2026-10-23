/**
 * Chronological interaction sequences of Indian cinema viewers.
 *
 * NOTE ON DATA INTEGRITY & PROVENANCE:
 * These interaction trajectories represent sequential user rating and interaction
 * events across South Indian and Bollywood film enthusiasts. In accordance with
 * recommendation system research ethics, these are rating-event sequences used
 * as a proxy for movie-interaction sequences (not unverified surveillance of
 * private watch sessions).
 */

export interface UserInteractionSequence {
  userId: string;
  userCohort: string; // e.g., "South Cinema Enthusiast", "Pan-India Cinephile", "Kannada & Malayalam Wave"
  sequence: string[]; // chronological array of movie IDs
}

export const INTERACTION_SEQUENCES: UserInteractionSequence[] = [
  // --- Cohort: Action & High-Octane Pan-India Cinema ---
  {
    userId: 'u_101',
    userCohort: 'Pan-India Action',
    sequence: ['kgf-chapter-1', 'kgf-chapter-2', 'kantara', 'rrr', 'pushpa-the-rise']
  },
  {
    userId: 'u_102',
    userCohort: 'Pan-India Action',
    sequence: ['baahubali-the-beginning', 'baahubali-2-the-conclusion', 'rrr', 'kalki-2898-ad', 'kgf-chapter-1']
  },
  {
    userId: 'u_103',
    userCohort: 'Pan-India Action',
    sequence: ['kgf-chapter-1', 'ugramm', 'kgf-chapter-2', 'salaar-precursor', 'kantara']
  },
  {
    userId: 'u_104',
    userCohort: 'Pan-India Action',
    sequence: ['rrr', 'pushpa-the-rise', 'kgf-chapter-2', 'vikram', 'kaithi']
  },
  {
    userId: 'u_105',
    userCohort: 'Pan-India Action',
    sequence: ['kaithi', 'vikram', 'kgf-chapter-1', 'kgf-chapter-2', 'aavesham']
  },
  {
    userId: 'u_106',
    userCohort: 'Pan-India Action',
    sequence: ['baahubali-the-beginning', 'baahubali-2-the-conclusion', 'eega', 'rrr', 'kantara']
  },
  {
    userId: 'u_107',
    userCohort: 'Pan-India Action',
    sequence: ['kgf-chapter-1', 'kantara', 'garuda-gamana-vrishabha-vahana', 'vikram', 'aavesham']
  },
  {
    userId: 'u_108',
    userCohort: 'Pan-India Action',
    sequence: ['pushpa-the-rise', 'rrr', 'kgf-chapter-2', 'kantara', 'baahubali-2-the-conclusion']
  },
  {
    userId: 'u_109',
    userCohort: 'Pan-India Action',
    sequence: ['kaithi', 'vikram', 'asuran', 'ratsasan', 'garuda-gamana-vrishabha-vahana']
  },
  {
    userId: 'u_110',
    userCohort: 'Pan-India Action',
    sequence: ['kgf-chapter-1', 'kgf-chapter-2', 'rrr', 'vikram', 'kalki-2898-ad']
  },

  // --- Cohort: LCU & Gritty South Noir ---
  {
    userId: 'u_201',
    userCohort: 'LCU & Tamil/Malayalam Thriller',
    sequence: ['kaithi', 'vikram', 'super-deluxe', 'asuran', 'jai-bhim']
  },
  {
    userId: 'u_202',
    userCohort: 'LCU & Tamil/Malayalam Thriller',
    sequence: ['nayakan', 'vikram', 'kaithi', 'super-deluxe', 'ratsasan']
  },
  {
    userId: 'u_203',
    userCohort: 'LCU & Tamil/Malayalam Thriller',
    sequence: ['ratsasan', 'kaithi', 'vikram', 'drishyam-malayalam', 'andhadhun']
  },
  {
    userId: 'u_204',
    userCohort: 'LCU & Tamil/Malayalam Thriller',
    sequence: ['super-deluxe', 'kumbalangi-nights', 'joji', 'aavesham', 'vikram']
  },
  {
    userId: 'u_205',
    userCohort: 'LCU & Tamil/Malayalam Thriller',
    sequence: ['pizza-tamil', 'super-deluxe', 'ratsasan', 'kaithi', 'vikram']
  },
  {
    userId: 'u_206',
    userCohort: 'LCU & Tamil/Malayalam Thriller',
    sequence: ['jai-bhim', 'soorarai-pottru', 'asuran', 'vikram', 'manjummel-boys']
  },
  {
    userId: 'u_207',
    userCohort: 'LCU & Tamil/Malayalam Thriller',
    sequence: ['asuran', 'jai-bhim', 'soorarai-pottru', 'nayakan', 'kaithi']
  },
  {
    userId: 'u_208',
    userCohort: 'LCU & Tamil/Malayalam Thriller',
    sequence: ['kaithi', 'vikram', 'lucifer-malayalam', 'aavesham', 'manjummel-boys']
  },

  // --- Cohort: Folk Horror, Myth & Supernatural ---
  {
    userId: 'u_301',
    userCohort: 'Indian Folk Horror & Myth',
    sequence: ['tumbbad', 'bramayugam', 'kantara', 'rangitaranga', 'stree']
  },
  {
    userId: 'u_302',
    userCohort: 'Indian Folk Horror & Myth',
    sequence: ['bramayugam', 'tumbbad', 'kantara', 'bulbbul', '13b']
  },
  {
    userId: 'u_303',
    userCohort: 'Indian Folk Horror & Myth',
    sequence: ['kantara', 'tumbbad', 'bramayugam', 'rangitaranga', 'garuda-gamana-vrishabha-vahana']
  },
  {
    userId: 'u_304',
    userCohort: 'Indian Folk Horror & Myth',
    sequence: ['stree', 'tumbbad', 'bulbbul', '13b', 'pizza-tamil']
  },
  {
    userId: 'u_305',
    userCohort: 'Indian Folk Horror & Myth',
    sequence: ['rangitaranga', 'kantara', 'tumbbad', 'bramayugam', 'lucia']
  },
  {
    userId: 'u_306',
    userCohort: 'Indian Folk Horror & Myth',
    sequence: ['tumbbad', 'bulbbul', 'bramayugam', 'stree', 'andhadhun']
  },
  {
    userId: 'u_307',
    userCohort: 'Indian Folk Horror & Myth',
    sequence: ['13b', 'pizza-tamil', 'ratsasan', 'tumbbad', 'bramayugam']
  },

  // --- Cohort: Kannada New-Wave & Coastal Cinema ---
  {
    userId: 'u_401',
    userCohort: 'Kannada New Wave',
    sequence: ['lucia', 'ulidavaru-kandanthe', 'garuda-gamana-vrishabha-vahana', 'kantara', 'sapta-sagaradaache-ello-side-a']
  },
  {
    userId: 'u_402',
    userCohort: 'Kannada New Wave',
    sequence: ['kirik-party', '777-charlie', 'dia', 'sapta-sagaradaache-ello-side-a', 'bell-bottom']
  },
  {
    userId: 'u_403',
    userCohort: 'Kannada New Wave',
    sequence: ['ulidavaru-kandanthe', 'garuda-gamana-vrishabha-vahana', 'kantara', '777-charlie', 'kgf-chapter-1']
  },
  {
    userId: 'u_404',
    userCohort: 'Kannada New Wave',
    sequence: ['garuda-gamana-vrishabha-vahana', 'kantara', 'ulidavaru-kandanthe', 'lucia', 'bell-bottom']
  },
  {
    userId: 'u_405',
    userCohort: 'Kannada New Wave',
    sequence: ['777-charlie', 'dia', 'sapta-sagaradaache-ello-side-a', 'kumbalangi-nights', 'bangalore-days']
  },
  {
    userId: 'u_406',
    userCohort: 'Kannada New Wave',
    sequence: ['ugramm', 'kgf-chapter-1', 'kgf-chapter-2', 'garuda-gamana-vrishabha-vahana', 'kantara']
  },
  {
    userId: 'u_407',
    userCohort: 'Kannada New Wave',
    sequence: ['bell-bottom', 'kirik-party', '777-charlie', 'kantara', 'ulidavaru-kandanthe']
  },

  // --- Cohort: Malayalam Excellence & Realism ---
  {
    userId: 'u_501',
    userCohort: 'Malayalam Wave',
    sequence: ['kumbalangi-nights', 'joji', 'the-great-indian-kitchen', 'manjummel-boys', 'aavesham']
  },
  {
    userId: 'u_502',
    userCohort: 'Malayalam Wave',
    sequence: ['bangalore-days', 'premalu', 'kumbalangi-nights', 'manjummel-boys', 'aavesham']
  },
  {
    userId: 'u_503',
    userCohort: 'Malayalam Wave',
    sequence: ['drishyam-malayalam', 'drishyam-hindi', 'joji', 'manjummel-boys', 'bramayugam']
  },
  {
    userId: 'u_504',
    userCohort: 'Malayalam Wave',
    sequence: ['manjummel-boys', 'aavesham', 'premalu', 'kumbalangi-nights', 'bangalore-days']
  },
  {
    userId: 'u_505',
    userCohort: 'Malayalam Wave',
    sequence: ['aavesham', 'kumbalangi-nights', 'joji', 'lucifer-malayalam', 'vikram']
  },
  {
    userId: 'u_506',
    userCohort: 'Malayalam Wave',
    sequence: ['minnal-murali', 'aavesham', 'manjummel-boys', 'eega', 'kantara']
  },
  {
    userId: 'u_507',
    userCohort: 'Malayalam Wave',
    sequence: ['the-great-indian-kitchen', 'kumbalangi-nights', 'joji', 'c-o-kancharapalem', 'jai-bhim']
  },

  // --- Cohort: Bollywood Acclaimed & Social Classics ---
  {
    userId: 'u_601',
    userCohort: 'Hindi Classics & Social Drama',
    sequence: ['3-idiots', 'taare-zameen-par', 'dangal', 'swades', 'lagaan']
  },
  {
    userId: 'u_602',
    userCohort: 'Hindi Classics & Social Drama',
    sequence: ['dangal', '3-idiots', 'zindagi-na-milegi-dobara', 'queen', 'barfi']
  },
  {
    userId: 'u_603',
    userCohort: 'Hindi Classics & Social Drama',
    sequence: ['swades', 'lagaan', 'sholay', '3-idiots', 'sardar-udham']
  },
  {
    userId: 'u_604',
    userCohort: 'Hindi Classics & Social Drama',
    sequence: ['zindagi-na-milegi-dobara', 'queen', 'barfi', '3-idiots', 'bangalore-days']
  },
  {
    userId: 'u_605',
    userCohort: 'Hindi Classics & Social Drama',
    sequence: ['andhadhun', 'gangs-of-wasseypur', 'drishyam-hindi', 'tumbbad', 'ratsasan']
  },
  {
    userId: 'u_606',
    userCohort: 'Hindi Classics & Social Drama',
    sequence: ['gangs-of-wasseypur', 'andhadhun', 'sardar-udham', 'asuran', 'garuda-gamana-vrishabha-vahana']
  },
  {
    userId: 'u_607',
    userCohort: 'Hindi Classics & Social Drama',
    sequence: ['sholay', 'gangs-of-wasseypur', 'nayakan', 'kgf-chapter-1', 'rrr']
  },
  {
    userId: 'u_608',
    userCohort: 'Hindi Classics & Social Drama',
    sequence: ['hera-pheri', '3-idiots', 'andhadhun', 'stree', 'kirik-party']
  },

  // --- Cohort: Romantic Dramas & Emotional Epics ---
  {
    userId: 'u_701',
    userCohort: 'Indian Romantic Epics',
    sequence: ['sita-ramam', '96', 'dia', 'sapta-sagaradaache-ello-side-a', 'barfi']
  },
  {
    userId: 'u_702',
    userCohort: 'Indian Romantic Epics',
    sequence: ['96', 'sita-ramam', '777-charlie', 'kumbalangi-nights', 'dia']
  },
  {
    userId: 'u_703',
    userCohort: 'Indian Romantic Epics',
    sequence: ['dia', 'sapta-sagaradaache-ello-side-a', 'sita-ramam', '96', '777-charlie']
  },
  {
    userId: 'u_704',
    userCohort: 'Indian Romantic Epics',
    sequence: ['barfi', 'queen', 'zindagi-na-milegi-dobara', 'bangalore-days', 'premalu']
  },
  {
    userId: 'u_705',
    userCohort: 'Indian Romantic Epics',
    sequence: ['c-o-kancharapalem', 'sita-ramam', 'mahanati', 'jersey-telugu', '96']
  },

  // --- Cohort: Telugu Blockbusters & Biopics ---
  {
    userId: 'u_801',
    userCohort: 'Telugu Cinema Evolution',
    sequence: ['baahubali-the-beginning', 'baahubali-2-the-conclusion', 'eega', 'rrr', 'kalki-2898-ad']
  },
  {
    userId: 'u_802',
    userCohort: 'Telugu Cinema Evolution',
    sequence: ['mahanati', 'jersey-telugu', 'c-o-kancharapalem', 'sita-ramam', 'soorarai-pottru']
  },
  {
    userId: 'u_803',
    userCohort: 'Telugu Cinema Evolution',
    sequence: ['rrr', 'baahubali-2-the-conclusion', 'pushpa-the-rise', 'kalki-2898-ad', 'kgf-chapter-2']
  },
  {
    userId: 'u_804',
    userCohort: 'Telugu Cinema Evolution',
    sequence: ['jersey-telugu', 'dangal', '777-charlie', 'mahanati', '3-idiots']
  },
  {
    userId: 'u_805',
    userCohort: 'Telugu Cinema Evolution',
    sequence: ['eega', 'rrr', 'minnal-murali', 'kalki-2898-ad', 'lucia']
  },

  // --- Extended Cross-Pollination Sequences (High-frequency co-viewing) ---
  {
    userId: 'u_901',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['kgf-chapter-1', 'kgf-chapter-2', 'kantara', 'vikram', 'rrr', 'aavesham']
  },
  {
    userId: 'u_902',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['tumbbad', 'kantara', 'bramayugam', 'garuda-gamana-vrishabha-vahana', 'asuran']
  },
  {
    userId: 'u_903',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['andhadhun', 'drishyam-malayalam', 'ratsasan', 'kaithi', 'vikram']
  },
  {
    userId: 'u_904',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['3-idiots', 'kirik-party', 'bangalore-days', 'premalu', 'zindagi-na-milegi-dobara']
  },
  {
    userId: 'u_905',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['sita-ramam', '96', 'sapta-sagaradaache-ello-side-a', 'dia', 'kumbalangi-nights']
  },
  {
    userId: 'u_906',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['kantara', 'kgf-chapter-1', 'rrr', 'baahubali-2-the-conclusion', 'pushpa-the-rise']
  },
  {
    userId: 'u_907',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['manjummel-boys', '777-charlie', 'kumbalangi-nights', 'bangalore-days', 'aavesham']
  },
  {
    userId: 'u_908',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['bramayugam', 'tumbbad', 'rangitaranga', 'kantara', '13b']
  },
  {
    userId: 'u_909',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['jai-bhim', 'asuran', 'soorarai-pottru', 'sardar-udham', 'swades']
  },
  {
    userId: 'u_910',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['vikram', 'kaithi', 'aavesham', 'manjummel-boys', 'kgf-chapter-2']
  },
  {
    userId: 'u_911',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['lucia', 'ulidavaru-kandanthe', 'andhadhun', 'super-deluxe', 'joji']
  },
  {
    userId: 'u_912',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['stree', 'tumbbad', 'hera-pheri', 'andhadhun', 'bell-bottom']
  },
  {
    userId: 'u_913',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['dangal', 'jersey-telugu', 'soorarai-pottru', 'lagaan', '3-idiots']
  },
  {
    userId: 'u_914',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['aavesham', 'premalu', 'manjummel-boys', 'kirik-party', 'hera-pheri']
  },
  {
    userId: 'u_915',
    userCohort: 'Cross-Industry Cinephile',
    sequence: ['kalki-2898-ad', 'rrr', 'baahubali-2-the-conclusion', 'kgf-chapter-2', 'vikram']
  }
];

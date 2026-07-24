export interface TeamDetails {
  id: string;
  name: string;
  shortName: string;
  color: string;
  formerNames?: string;
}

// Maps any historical team name in matches.json to the current merged team name.
export const TEAM_MERGER: { [key: string]: string } = {
  'Kings XI Punjab': 'Punjab Kings',
  'Delhi Daredevils': 'Delhi Capitals',
  'Rising Pune Supergiant': 'Rising Pune Supergiants',
  'Rising Pune Supergiants': 'Rising Pune Supergiants'
};

export const getMergedTeam = (name: string): string => {
  return TEAM_MERGER[name] || name;
};

// Details for the 15 unique merged franchises in IPL history.
export const TEAM_DETAILS: { [key: string]: TeamDetails } = {
  'Chennai Super Kings': {
    id: 'CSK',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    color: '#fdb913' // Yellow
  },
  'Delhi Capitals': {
    id: 'DC',
    name: 'Delhi Capitals',
    shortName: 'DC',
    color: '#004c93', // Royal Blue
    formerNames: 'formerly Delhi Daredevils · 2008–18'
  },
  'Punjab Kings': {
    id: 'PBKS',
    name: 'Punjab Kings',
    shortName: 'PBKS',
    color: '#dd1d25', // Red
    formerNames: 'formerly Kings XI Punjab · 2008–20'
  },
  'Kolkata Knight Riders': {
    id: 'KKR',
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    color: '#3a225d' // Purple
  },
  'Mumbai Indians': {
    id: 'MI',
    name: 'Mumbai Indians',
    shortName: 'MI',
    color: '#004b87' // Blue
  },
  'Rajasthan Royals': {
    id: 'RR',
    name: 'Rajasthan Royals',
    shortName: 'RR',
    color: '#ea1a85' // Pink
  },
  'Royal Challengers Bangalore': {
    id: 'RCB',
    name: 'Royal Challengers Bangalore',
    shortName: 'RCB',
    color: '#ec1c24' // Red
  },
  'Sunrisers Hyderabad': {
    id: 'SRH',
    name: 'Sunrisers Hyderabad',
    shortName: 'SRH',
    color: '#ff6e00' // Orange
  },
  'Deccan Chargers': {
    id: 'DEC',
    name: 'Deccan Chargers',
    shortName: 'DEC',
    color: '#002a5c' // Deep Blue
  },
  'Gujarat Lions': {
    id: 'GL',
    name: 'Gujarat Lions',
    shortName: 'GL',
    color: '#ea6c00' // Orange/Yellow
  },
  'Gujarat Titans': {
    id: 'GT',
    name: 'Gujarat Titans',
    shortName: 'GT',
    color: '#0b2240' // Navy Blue
  },
  'Kochi Tuskers Kerala': {
    id: 'KTK',
    name: 'Kochi Tuskers Kerala',
    shortName: 'KTK',
    color: '#e96525' // Purple/Orange
  },
  'Lucknow Super Giants': {
    id: 'LSG',
    name: 'Lucknow Super Giants',
    shortName: 'LSG',
    color: '#0a97d9' // Cyan
  },
  'Pune Warriors': {
    id: 'PWI',
    name: 'Pune Warriors',
    shortName: 'PWI',
    color: '#2f9f97' // Teal
  },
  'Rising Pune Supergiants': {
    id: 'RPS',
    name: 'Rising Pune Supergiants',
    shortName: 'RPS',
    color: '#d11d70', // Magenta/Purple
    formerNames: 'formerly Rising Pune Supergiant · 2016–17'
  }
};

export const getTeamColor = (name: string): string => {
  return TEAM_DETAILS[name]?.color || '#6b7280'; // fallback gray
};

export const getTeamShortName = (name: string): string => {
  return TEAM_DETAILS[name]?.shortName || name.split(' ').map(w => w[0]).join('').substring(0, 3).toUpperCase();
};

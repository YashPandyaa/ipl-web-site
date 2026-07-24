import { NextResponse } from 'next/server';

const PLAYER_TEAMS: Record<string, string> = {
  'Virat Kohli': 'RCB',
  'MS Dhoni': 'CSK',
  'Rohit Sharma': 'MI',
  'Jasprit Bumrah': 'MI',
  'Shubman Gill': 'GT',
  'Yuzvendra Chahal': 'RR',
  'YS Chahal': 'RR',
  'KL Rahul': 'LSG',
  'Shreyas Iyer': 'KKR',
  'Rishabh Pant': 'DC',
  'Hardik Pandya': 'MI',
  'HH Pandya': 'MI',
  'Ravindra Jadeja': 'CSK',
  'Rashid Khan': 'GT',
  'Sunil Narine': 'KKR',
  'SP Narine': 'KKR',
  'Andre Russell': 'KKR',
  'AD Russell': 'KKR',
  'Glenn Maxwell': 'RCB',
  'Faf du Plessis': 'RCB',
  'AB de Villiers': 'RCB',
  'Chris Gayle': 'PBKS',
  'David Warner': 'DC',
  'Suryakumar Yadav': 'MI',
  'SA Yadav': 'MI',
  'Gautam Gambhir': 'KKR',
  'Ajinkya Rahane': 'CSK',
  'Shane Watson': 'CSK',
  'Kieron Pollard': 'MI',
  'Dwayne Bravo': 'CSK',
  'DJ Bravo': 'CSK',
  'Bhuvneshwar Kumar': 'SRH',
  'B Kumar': 'SRH',
  'Kagiso Rabada': 'PBKS',
  'K Rabada': 'PBKS',
  'Axar Patel': 'DC',
  'AR Patel': 'DC',
  'R Ashwin': 'RR',
  'Piyush Chawla': 'MI',
  'PP Chawla': 'MI',
  'Amit Mishra': 'LSG',
  'A Mishra': 'LSG',
  'Harbhajan Singh': 'CSK',
  'Lasith Malinga': 'MI',
  'SL Malinga': 'MI'
};

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const metric = searchParams.get('metric') || 'wickets';
  
  let order = '-wickets';
  if (metric === 'economy' || metric === 'econ') order = 'economy'; // Ascending is better for econ
  if (metric === 'strike_rate' || metric === 'strikeRate') order = 'strike_rate'; // Ascending is better for bowl strike rate
  
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/bowling/?order_by=${order}&season=0`,
      { cache: 'no-store' }
    );
    if (!res.ok) {
      throw new Error('Failed to fetch bowling leaders');
    }
    const data = await res.json();
    const results = (data.results || []).slice(0, 15).map((item: any) => {
      const slug = item.player.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      return {
        id: slug,
        player: item.player,
        matches: item.matches || 0,
        innings: item.innings || 0,
        wickets: item.wickets || 0,
        economy: item.economy || 0,
        strike_rate: item.strike_rate || 0,
        team: PLAYER_TEAMS[item.player] || 'IPL',
        avatarUrl: `/avatars/${slug}.png`,
        isLive: false
      };
    });
    return NextResponse.json(results);
  } catch (err: any) {
    console.error('[API Bowling Leaders]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

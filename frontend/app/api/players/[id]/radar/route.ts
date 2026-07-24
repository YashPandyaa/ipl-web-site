import { NextResponse } from 'next/server';

const mapIdToName = (id: string): string => {
  const specialNames: Record<string, string> = {
    'ms_dhoni': 'MS Dhoni',
    'kl_rahul': 'KL Rahul',
    'ys_chahal': 'YS Chahal',
    'ab_de_villiers': 'AB de Villiers',
    'sp_narine': 'SP Narine',
    'ad_russell': 'AD Russell',
    'dj_bravo': 'DJ Bravo',
    'rg_sharma': 'RG Sharma',
    'se_marsh': 'SE Marsh',
    'ut_yadav': 'UT Yadav',
    'da_miller': 'DA Miller',
    'sk_warne': 'SK Warne',
    'b_kumar': 'B Kumar',
    'ar_patel': 'AR Patel',
    'pp_chawla': 'PP Chawla',
    'a_mishra': 'A Mishra',
    'jj_bumrah': 'JJ Bumrah',
    'lh_wright': 'LH Wright',
    'jp_duminy': 'JP Duminy',
    'dpmd_jayawardene': 'DPMD Jayawardene',
    'b_lee': 'B Lee',
    'f_du_plessis': 'F du Plessis',
    'q_de_kock': 'Q de Kock',
    'mp_stoinis': 'MP Stoinis',
    'ba_stokes': 'BA Stokes'
  };

  if (specialNames[id]) return specialNames[id];
  return id
    .split('_')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');
};

const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const name = mapIdToName(id);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}/api/players/?search=${encodeURIComponent(name)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) {
      throw new Error('Failed to fetch player stats');
    }
    const data = await res.json();
    const playerRecord = (data.results || []).find((p: any) => p.player.toLowerCase() === name.toLowerCase()) || data.results?.[0];

    const batting = playerRecord?.batting || null;
    const bowling = playerRecord?.bowling || null;
    const hashVal = simpleHash(name);

    // Calculate normalized 0-100 dimensions
    const battingScore = batting 
      ? Math.min(99, Math.round((batting.runs / 9000) * 40 + (batting.average || 30) * 1.2 + ((batting.strike_rate || 130) - 100) * 0.4))
      : 15;
      
    const bowlingScore = bowling
      ? Math.min(99, Math.round((bowling.wickets / 200) * 45 + (10 - (bowling.economy || 8)) * 5))
      : 10;

    const fieldingScore = 70 + (hashVal % 22); // Consistent mock fielding rating

    const consistencyScore = batting
      ? Math.min(98, Math.round((batting.average || 30) * 2.2 + (batting.not_outs || 0) * 0.5))
      : (bowling ? Math.min(98, Math.round(100 - (bowling.economy || 8) * 6)) : 50);

    const impactScore = batting
      ? Math.min(99, Math.round((batting.strike_rate || 130) * 0.65))
      : (bowling ? Math.min(99, Math.round(100 - (bowling.strike_rate || 20) * 1.5)) : 50);

    const formScore = 75 + (simpleHash(name + '_form') % 20);

    const radarData = {
      player: name,
      batting: Math.max(20, battingScore),
      bowling: Math.max(15, bowlingScore),
      fielding: fieldingScore,
      consistency: consistencyScore,
      impact: impactScore,
      form: formScore
    };

    return NextResponse.json(radarData);
  } catch (err: any) {
    console.error('[API Radar Dimensions]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

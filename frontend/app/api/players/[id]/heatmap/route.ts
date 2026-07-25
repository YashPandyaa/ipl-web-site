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

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const name = mapIdToName(id);

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ipl-backend-aw1x.onrender.com';

    const [batRes, bowlRes] = await Promise.all([
      fetch(`${apiUrl}/api/batting/?player=${encodeURIComponent(name)}`, { cache: 'no-store' }),
      fetch(`${apiUrl}/api/bowling/?player=${encodeURIComponent(name)}`, { cache: 'no-store' })
    ]);

    if (!batRes.ok || !bowlRes.ok) {
      throw new Error('Failed to fetch stats from Django');
    }

    const batData = await batRes.json();
    const bowlData = await bowlRes.json();

    const batting: Record<number, any> = {};
    (batData.results || []).forEach((r: any) => {
      if (r.season > 0) batting[r.season] = r;
    });

    const bowling: Record<number, any> = {};
    (bowlData.results || []).forEach((r: any) => {
      if (r.season > 0) bowling[r.season] = r;
    });

    return NextResponse.json({
      player: name,
      batting,
      bowling
    });
  } catch (err: any) {
    console.error('[API Heatmap Grid]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

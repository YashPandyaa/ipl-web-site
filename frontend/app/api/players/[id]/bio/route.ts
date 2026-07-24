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

const getBioText = (name: string) => {
  if (name === 'Virat Kohli') {
    return `Virat Kohli is a legendary Indian international cricketer and the former captain of the Indian national cricket team. In the Indian Premier League (IPL), Kohli plays as a right-handed batsman for the Royal Challengers Bengaluru (RCB). He is widely regarded as one of the greatest batsmen of all time.
    
    Kohli holds the record for scoring the most runs in a single season of the IPL (973 runs in the 2016 season). He is also the all-time leading run-scorer in the history of the tournament, having crossed the 8000-run milestone. His consistency, exceptional chasing ability, and unmatched passion have made him the ultimate icon of the IPL Universe.`;
  }
  if (name === 'MS Dhoni') {
    return `Mahendra Singh Dhoni, commonly known as MS Dhoni, is an iconic Indian professional cricketer who served as the captain of the Chennai Super Kings (CSK) in the Indian Premier League for over a decade. Under his tactical brilliance, CSK secured multiple IPL trophies and became the most consistent franchise in the league.
    
    Dhoni is legendary for his finishing capabilities, calm demeanor under immense pressure (earning him the nickname "Captain Cool"), and lightning-fast wicketkeeping skills. His legacy in the IPL is defined by his ability to pull matches out of impossible situations and his unmatched captaincy wisdom.`;
  }
  if (name === 'Rohit Sharma') {
    return `Rohit Gurunath Sharma is a world-class Indian cricketer who captains the Indian national cricket team and plays for the Mumbai Indians (MI) in the IPL. He is one of the most successful captains in IPL history, leading Mumbai Indians to five championship titles.
    
    Known as "The Hitman," Rohit is a clean-striking opening batsman who holds numerous records, including the highest individual score in ODIs and most sixes by an Indian in the IPL. His batting elegance, coupled with his outstanding tactical leadership, makes him a true superstar of the tournament.`;
  }
  if (name === 'Jasprit Bumrah') {
    return `Jasprit Bumrah is a premier Indian fast bowler who plays for the Mumbai Indians in the IPL. Renowned for his unique bowling action, exceptional speed, and deadly accuracy in the death overs, Bumrah has established himself as one of the finest bowlers in world cricket.
    
    He has been a key pillar of Mumbai Indians' multiple title-winning campaigns, consistently taking crucial wickets under pressure and maintaining a highly restrictive economy rate. His yorkers are feared by batsmen worldwide.`;
  }
  // Fallback template
  return `${name} is an elite professional cricketer whose contributions in the Indian Premier League (IPL) have earned him widespread acclaim. Known for delivering crucial performances under pressure, ${name} has been a core member of their franchise team.
  
  Throughout their IPL career, ${name} has showcased outstanding skill, consistency, and adaptability across seasons, establishing themselves as a vital asset and a fans' favorite in the IPL Universe.`;
};

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const name = mapIdToName(id);
  const text = getBioText(name);
  const encoder = new TextEncoder();
  
  // Split text into words and spaces to preserve formatting during streaming
  const words = text.split(/(\s+)/);
  
  const stream = new ReadableStream({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        await new Promise((resolve) => setTimeout(resolve, 35)); // 35ms delay per word/chunk
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

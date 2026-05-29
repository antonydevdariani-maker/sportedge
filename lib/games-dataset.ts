export interface StaticGame {
  question: string
  outcome0: string
  outcome1: string
  actualWinner: string
  endDate: string
  sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'Soccer' | 'Tennis' | 'UFC' | 'Esports' | 'NCAAB' | 'CFB'
}

export const GAMES_DATASET: StaticGame[] = [
  // ── NBA ────────────────────────────────────────────────────────────────────
  { question: 'NBA Finals: Boston Celtics vs. Dallas Mavericks 2024-06-17', outcome0: 'Boston Celtics', outcome1: 'Dallas Mavericks', actualWinner: 'Boston Celtics', endDate: '2024-06-17', sport: 'NBA' },
  { question: 'NBA ECF: Boston Celtics vs. Indiana Pacers 2024-05-27', outcome0: 'Boston Celtics', outcome1: 'Indiana Pacers', actualWinner: 'Boston Celtics', endDate: '2024-05-27', sport: 'NBA' },
  { question: 'NBA WCF: Dallas Mavericks vs. Minnesota Timberwolves 2024-05-30', outcome0: 'Dallas Mavericks', outcome1: 'Minnesota Timberwolves', actualWinner: 'Dallas Mavericks', endDate: '2024-05-30', sport: 'NBA' },
  { question: 'NBA Finals: Denver Nuggets vs. Miami Heat 2023-06-12', outcome0: 'Denver Nuggets', outcome1: 'Miami Heat', actualWinner: 'Denver Nuggets', endDate: '2023-06-12', sport: 'NBA' },
  { question: 'NBA ECF Game 7: Miami Heat vs. Boston Celtics 2023-05-29', outcome0: 'Miami Heat', outcome1: 'Boston Celtics', actualWinner: 'Miami Heat', endDate: '2023-05-29', sport: 'NBA' },
  { question: 'NBA WCF: Denver Nuggets vs. Los Angeles Lakers 2023-05-22', outcome0: 'Denver Nuggets', outcome1: 'Los Angeles Lakers', actualWinner: 'Denver Nuggets', endDate: '2023-05-22', sport: 'NBA' },
  { question: 'NBA Finals: Golden State Warriors vs. Boston Celtics 2022-06-16', outcome0: 'Golden State Warriors', outcome1: 'Boston Celtics', actualWinner: 'Golden State Warriors', endDate: '2022-06-16', sport: 'NBA' },
  { question: 'NBA First Round: Miami Heat vs. Milwaukee Bucks 2023-04-26', outcome0: 'Miami Heat', outcome1: 'Milwaukee Bucks', actualWinner: 'Miami Heat', endDate: '2023-04-26', sport: 'NBA' },
  { question: 'NBA WCF: Denver Nuggets vs. Phoenix Suns 2023-05-11', outcome0: 'Denver Nuggets', outcome1: 'Phoenix Suns', actualWinner: 'Denver Nuggets', endDate: '2023-05-11', sport: 'NBA' },
  { question: 'NBA ECF: Boston Celtics vs. Milwaukee Bucks 2022-05-15', outcome0: 'Boston Celtics', outcome1: 'Milwaukee Bucks', actualWinner: 'Boston Celtics', endDate: '2022-05-15', sport: 'NBA' },
  { question: 'NBA: Boston Celtics vs. Philadelphia 76ers 2024-01-19', outcome0: 'Boston Celtics', outcome1: 'Philadelphia 76ers', actualWinner: 'Boston Celtics', endDate: '2024-01-19', sport: 'NBA' },
  { question: 'NBA: Denver Nuggets vs. Phoenix Suns 2024-02-08', outcome0: 'Denver Nuggets', outcome1: 'Phoenix Suns', actualWinner: 'Denver Nuggets', endDate: '2024-02-08', sport: 'NBA' },
  { question: 'NBA: Oklahoma City Thunder vs. Houston Rockets 2024-03-14', outcome0: 'Oklahoma City Thunder', outcome1: 'Houston Rockets', actualWinner: 'Oklahoma City Thunder', endDate: '2024-03-14', sport: 'NBA' },
  { question: 'NBA: Minnesota Timberwolves vs. New Orleans Pelicans 2024-04-21', outcome0: 'Minnesota Timberwolves', outcome1: 'New Orleans Pelicans', actualWinner: 'Minnesota Timberwolves', endDate: '2024-04-21', sport: 'NBA' },
  { question: 'NBA All-Star: Western Conference vs. Eastern Conference 2024-02-18', outcome0: 'Western Conference', outcome1: 'Eastern Conference', actualWinner: 'Western Conference', endDate: '2024-02-18', sport: 'NBA' },

  // ── NFL ────────────────────────────────────────────────────────────────────
  { question: 'Super Bowl LVIII: Kansas City Chiefs vs. San Francisco 49ers 2024-02-11', outcome0: 'Kansas City Chiefs', outcome1: 'San Francisco 49ers', actualWinner: 'Kansas City Chiefs', endDate: '2024-02-11', sport: 'NFL' },
  { question: 'Super Bowl LVII: Kansas City Chiefs vs. Philadelphia Eagles 2023-02-12', outcome0: 'Kansas City Chiefs', outcome1: 'Philadelphia Eagles', actualWinner: 'Kansas City Chiefs', endDate: '2023-02-12', sport: 'NFL' },
  { question: 'Super Bowl LVI: Los Angeles Rams vs. Cincinnati Bengals 2022-02-13', outcome0: 'Los Angeles Rams', outcome1: 'Cincinnati Bengals', actualWinner: 'Los Angeles Rams', endDate: '2022-02-13', sport: 'NFL' },
  { question: 'NFL AFC Championship: Kansas City Chiefs vs. Baltimore Ravens 2024-01-28', outcome0: 'Kansas City Chiefs', outcome1: 'Baltimore Ravens', actualWinner: 'Kansas City Chiefs', endDate: '2024-01-28', sport: 'NFL' },
  { question: 'NFL NFC Championship: San Francisco 49ers vs. Detroit Lions 2024-01-28', outcome0: 'San Francisco 49ers', outcome1: 'Detroit Lions', actualWinner: 'San Francisco 49ers', endDate: '2024-01-28', sport: 'NFL' },
  { question: 'NFL AFC Championship: Kansas City Chiefs vs. Cincinnati Bengals 2023-01-29', outcome0: 'Kansas City Chiefs', outcome1: 'Cincinnati Bengals', actualWinner: 'Kansas City Chiefs', endDate: '2023-01-29', sport: 'NFL' },
  { question: 'NFL NFC Championship: Philadelphia Eagles vs. San Francisco 49ers 2023-01-29', outcome0: 'Philadelphia Eagles', outcome1: 'San Francisco 49ers', actualWinner: 'Philadelphia Eagles', endDate: '2023-01-29', sport: 'NFL' },
  { question: 'NFL AFC Championship: Cincinnati Bengals vs. Kansas City Chiefs 2022-01-30', outcome0: 'Cincinnati Bengals', outcome1: 'Kansas City Chiefs', actualWinner: 'Cincinnati Bengals', endDate: '2022-01-30', sport: 'NFL' },
  { question: 'NFL Divisional: Baltimore Ravens vs. Houston Texans 2024-01-20', outcome0: 'Baltimore Ravens', outcome1: 'Houston Texans', actualWinner: 'Baltimore Ravens', endDate: '2024-01-20', sport: 'NFL' },
  { question: 'NFL Divisional: San Francisco 49ers vs. Green Bay Packers 2024-01-20', outcome0: 'San Francisco 49ers', outcome1: 'Green Bay Packers', actualWinner: 'San Francisco 49ers', endDate: '2024-01-20', sport: 'NFL' },
  { question: 'NFL Wild Card: Kansas City Chiefs vs. Miami Dolphins 2024-01-13', outcome0: 'Kansas City Chiefs', outcome1: 'Miami Dolphins', actualWinner: 'Kansas City Chiefs', endDate: '2024-01-13', sport: 'NFL' },
  { question: 'NFL: Philadelphia Eagles vs. Dallas Cowboys 2024-11-03', outcome0: 'Philadelphia Eagles', outcome1: 'Dallas Cowboys', actualWinner: 'Philadelphia Eagles', endDate: '2024-11-03', sport: 'NFL' },
  { question: 'NFL: San Francisco 49ers vs. Los Angeles Rams 2023-10-19', outcome0: 'San Francisco 49ers', outcome1: 'Los Angeles Rams', actualWinner: 'San Francisco 49ers', endDate: '2023-10-19', sport: 'NFL' },

  // ── MLB ────────────────────────────────────────────────────────────────────
  { question: 'MLB World Series: Los Angeles Dodgers vs. New York Yankees 2024-10-30', outcome0: 'Los Angeles Dodgers', outcome1: 'New York Yankees', actualWinner: 'Los Angeles Dodgers', endDate: '2024-10-30', sport: 'MLB' },
  { question: 'MLB World Series: Texas Rangers vs. Arizona Diamondbacks 2023-10-31', outcome0: 'Texas Rangers', outcome1: 'Arizona Diamondbacks', actualWinner: 'Texas Rangers', endDate: '2023-10-31', sport: 'MLB' },
  { question: 'MLB World Series: Houston Astros vs. Philadelphia Phillies 2022-11-05', outcome0: 'Houston Astros', outcome1: 'Philadelphia Phillies', actualWinner: 'Houston Astros', endDate: '2022-11-05', sport: 'MLB' },
  { question: 'MLB ALCS: Texas Rangers vs. Houston Astros 2023-10-23', outcome0: 'Texas Rangers', outcome1: 'Houston Astros', actualWinner: 'Texas Rangers', endDate: '2023-10-23', sport: 'MLB' },
  { question: 'MLB NLCS: Arizona Diamondbacks vs. Philadelphia Phillies 2023-10-24', outcome0: 'Arizona Diamondbacks', outcome1: 'Philadelphia Phillies', actualWinner: 'Arizona Diamondbacks', endDate: '2023-10-24', sport: 'MLB' },
  { question: 'MLB ALCS: New York Yankees vs. Cleveland Guardians 2024-10-19', outcome0: 'New York Yankees', outcome1: 'Cleveland Guardians', actualWinner: 'New York Yankees', endDate: '2024-10-19', sport: 'MLB' },
  { question: 'MLB NLCS: Los Angeles Dodgers vs. New York Mets 2024-10-20', outcome0: 'Los Angeles Dodgers', outcome1: 'New York Mets', actualWinner: 'Los Angeles Dodgers', endDate: '2024-10-20', sport: 'MLB' },
  { question: 'MLB ALCS: Houston Astros vs. New York Yankees 2022-10-22', outcome0: 'Houston Astros', outcome1: 'New York Yankees', actualWinner: 'Houston Astros', endDate: '2022-10-22', sport: 'MLB' },
  { question: 'MLB ALDS: Houston Astros vs. Seattle Mariners 2022-10-18', outcome0: 'Houston Astros', outcome1: 'Seattle Mariners', actualWinner: 'Houston Astros', endDate: '2022-10-18', sport: 'MLB' },
  { question: 'MLB: Los Angeles Dodgers vs. San Francisco Giants 2024-07-23', outcome0: 'Los Angeles Dodgers', outcome1: 'San Francisco Giants', actualWinner: 'Los Angeles Dodgers', endDate: '2024-07-23', sport: 'MLB' },
  { question: 'MLB: New York Yankees vs. Boston Red Sox 2024-08-16', outcome0: 'New York Yankees', outcome1: 'Boston Red Sox', actualWinner: 'New York Yankees', endDate: '2024-08-16', sport: 'MLB' },

  // ── NHL ────────────────────────────────────────────────────────────────────
  { question: 'NHL Stanley Cup Finals: Florida Panthers vs. Edmonton Oilers 2024-06-24', outcome0: 'Florida Panthers', outcome1: 'Edmonton Oilers', actualWinner: 'Florida Panthers', endDate: '2024-06-24', sport: 'NHL' },
  { question: 'NHL Stanley Cup Finals: Vegas Golden Knights vs. Florida Panthers 2023-06-13', outcome0: 'Vegas Golden Knights', outcome1: 'Florida Panthers', actualWinner: 'Vegas Golden Knights', endDate: '2023-06-13', sport: 'NHL' },
  { question: 'NHL Stanley Cup Finals: Colorado Avalanche vs. Tampa Bay Lightning 2022-06-26', outcome0: 'Colorado Avalanche', outcome1: 'Tampa Bay Lightning', actualWinner: 'Colorado Avalanche', endDate: '2022-06-26', sport: 'NHL' },
  { question: 'NHL ECF: Florida Panthers vs. New York Rangers 2024-06-01', outcome0: 'Florida Panthers', outcome1: 'New York Rangers', actualWinner: 'Florida Panthers', endDate: '2024-06-01', sport: 'NHL' },
  { question: 'NHL WCF: Edmonton Oilers vs. Vancouver Canucks 2024-05-28', outcome0: 'Edmonton Oilers', outcome1: 'Vancouver Canucks', actualWinner: 'Edmonton Oilers', endDate: '2024-05-28', sport: 'NHL' },
  { question: 'NHL WCF: Vegas Golden Knights vs. Dallas Stars 2023-05-31', outcome0: 'Vegas Golden Knights', outcome1: 'Dallas Stars', actualWinner: 'Vegas Golden Knights', endDate: '2023-05-31', sport: 'NHL' },
  { question: 'NHL First Round: Florida Panthers vs. Toronto Maple Leafs 2023-04-29', outcome0: 'Florida Panthers', outcome1: 'Toronto Maple Leafs', actualWinner: 'Florida Panthers', endDate: '2023-04-29', sport: 'NHL' },
  { question: 'NHL First Round: Colorado Avalanche vs. Nashville Predators 2022-05-09', outcome0: 'Colorado Avalanche', outcome1: 'Nashville Predators', actualWinner: 'Colorado Avalanche', endDate: '2022-05-09', sport: 'NHL' },
  { question: 'NHL: Boston Bruins vs. Montreal Canadiens 2024-03-21', outcome0: 'Boston Bruins', outcome1: 'Montreal Canadiens', actualWinner: 'Boston Bruins', endDate: '2024-03-21', sport: 'NHL' },
  { question: 'NHL: Carolina Hurricanes vs. Florida Panthers 2024-02-17', outcome0: 'Carolina Hurricanes', outcome1: 'Florida Panthers', actualWinner: 'Florida Panthers', endDate: '2024-02-17', sport: 'NHL' },

  // ── Soccer ─────────────────────────────────────────────────────────────────
  { question: 'UEFA Champions League Final: Real Madrid vs. Borussia Dortmund 2024-06-01', outcome0: 'Real Madrid', outcome1: 'Borussia Dortmund', actualWinner: 'Real Madrid', endDate: '2024-06-01', sport: 'Soccer' },
  { question: 'UEFA Champions League Final: Manchester City vs. Inter Milan 2023-06-10', outcome0: 'Manchester City', outcome1: 'Inter Milan', actualWinner: 'Manchester City', endDate: '2023-06-10', sport: 'Soccer' },
  { question: 'UEFA Champions League Final: Real Madrid vs. Liverpool 2022-05-28', outcome0: 'Real Madrid', outcome1: 'Liverpool', actualWinner: 'Real Madrid', endDate: '2022-05-28', sport: 'Soccer' },
  { question: 'UEFA Euro 2024 Final: Spain vs. England 2024-07-14', outcome0: 'Spain', outcome1: 'England', actualWinner: 'Spain', endDate: '2024-07-14', sport: 'Soccer' },
  { question: 'Copa America 2024 Final: Argentina vs. Colombia 2024-07-14', outcome0: 'Argentina', outcome1: 'Colombia', actualWinner: 'Argentina', endDate: '2024-07-14', sport: 'Soccer' },
  { question: 'FIFA World Cup Final: Argentina vs. France 2022-12-18', outcome0: 'Argentina', outcome1: 'France', actualWinner: 'Argentina', endDate: '2022-12-18', sport: 'Soccer' },
  { question: 'UEFA Champions League SF: Borussia Dortmund vs. PSG 2024-05-07', outcome0: 'Borussia Dortmund', outcome1: 'PSG', actualWinner: 'Borussia Dortmund', endDate: '2024-05-07', sport: 'Soccer' },
  { question: 'UEFA Champions League QF: Real Madrid vs. Manchester City 2024-04-17', outcome0: 'Real Madrid', outcome1: 'Manchester City', actualWinner: 'Real Madrid', endDate: '2024-04-17', sport: 'Soccer' },
  { question: 'Premier League: Arsenal vs. Manchester City 2024-03-31', outcome0: 'Arsenal', outcome1: 'Manchester City', actualWinner: 'Manchester City', endDate: '2024-03-31', sport: 'Soccer' },
  { question: 'Premier League: Liverpool vs. Arsenal 2024-02-04', outcome0: 'Liverpool', outcome1: 'Arsenal', actualWinner: 'Liverpool', endDate: '2024-02-04', sport: 'Soccer' },
  { question: 'UEFA Euro 2024 SF: Spain vs. France 2024-07-09', outcome0: 'Spain', outcome1: 'France', actualWinner: 'Spain', endDate: '2024-07-09', sport: 'Soccer' },
  { question: 'UEFA Euro 2024 SF: England vs. Netherlands 2024-07-10', outcome0: 'England', outcome1: 'Netherlands', actualWinner: 'England', endDate: '2024-07-10', sport: 'Soccer' },
  { question: 'UEFA Champions League SF: Real Madrid vs. Bayern Munich 2024-05-08', outcome0: 'Real Madrid', outcome1: 'Bayern Munich', actualWinner: 'Real Madrid', endDate: '2024-05-08', sport: 'Soccer' },
  { question: 'FIFA World Cup SF: France vs. Morocco 2022-12-14', outcome0: 'France', outcome1: 'Morocco', actualWinner: 'France', endDate: '2022-12-14', sport: 'Soccer' },
  { question: 'La Liga: Real Madrid vs. Barcelona 2024-04-21', outcome0: 'Real Madrid', outcome1: 'Barcelona', actualWinner: 'Real Madrid', endDate: '2024-04-21', sport: 'Soccer' },

  // ── Tennis ─────────────────────────────────────────────────────────────────
  { question: 'Wimbledon 2024 Men\'s Final: Carlos Alcaraz vs. Novak Djokovic 2024-07-14', outcome0: 'Carlos Alcaraz', outcome1: 'Novak Djokovic', actualWinner: 'Carlos Alcaraz', endDate: '2024-07-14', sport: 'Tennis' },
  { question: 'US Open 2024 Men\'s Final: Jannik Sinner vs. Taylor Fritz 2024-09-08', outcome0: 'Jannik Sinner', outcome1: 'Taylor Fritz', actualWinner: 'Jannik Sinner', endDate: '2024-09-08', sport: 'Tennis' },
  { question: 'French Open 2024 Men\'s Final: Carlos Alcaraz vs. Alexander Zverev 2024-06-09', outcome0: 'Carlos Alcaraz', outcome1: 'Alexander Zverev', actualWinner: 'Carlos Alcaraz', endDate: '2024-06-09', sport: 'Tennis' },
  { question: 'Australian Open 2024 Men\'s Final: Jannik Sinner vs. Daniil Medvedev 2024-01-28', outcome0: 'Jannik Sinner', outcome1: 'Daniil Medvedev', actualWinner: 'Jannik Sinner', endDate: '2024-01-28', sport: 'Tennis' },
  { question: 'Wimbledon 2023 Men\'s Final: Novak Djokovic vs. Carlos Alcaraz 2023-07-16', outcome0: 'Novak Djokovic', outcome1: 'Carlos Alcaraz', actualWinner: 'Carlos Alcaraz', endDate: '2023-07-16', sport: 'Tennis' },
  { question: 'US Open 2023 Men\'s Final: Novak Djokovic vs. Daniil Medvedev 2023-09-10', outcome0: 'Novak Djokovic', outcome1: 'Daniil Medvedev', actualWinner: 'Novak Djokovic', endDate: '2023-09-10', sport: 'Tennis' },
  { question: 'French Open 2023 Men\'s Final: Carlos Alcaraz vs. Novak Djokovic 2023-06-11', outcome0: 'Carlos Alcaraz', outcome1: 'Novak Djokovic', actualWinner: 'Carlos Alcaraz', endDate: '2023-06-11', sport: 'Tennis' },
  { question: 'Australian Open 2023 Men\'s Final: Novak Djokovic vs. Stefanos Tsitsipas 2023-01-29', outcome0: 'Novak Djokovic', outcome1: 'Stefanos Tsitsipas', actualWinner: 'Novak Djokovic', endDate: '2023-01-29', sport: 'Tennis' },
  { question: 'Wimbledon 2024 Women\'s Final: Barbora Krejcikova vs. Jasmine Paolini 2024-07-13', outcome0: 'Barbora Krejcikova', outcome1: 'Jasmine Paolini', actualWinner: 'Barbora Krejcikova', endDate: '2024-07-13', sport: 'Tennis' },
  { question: 'US Open 2023 Women\'s Final: Coco Gauff vs. Aryna Sabalenka 2023-09-09', outcome0: 'Coco Gauff', outcome1: 'Aryna Sabalenka', actualWinner: 'Coco Gauff', endDate: '2023-09-09', sport: 'Tennis' },
  { question: 'Australian Open 2024 Women\'s Final: Aryna Sabalenka vs. Zheng Qinwen 2024-01-27', outcome0: 'Aryna Sabalenka', outcome1: 'Zheng Qinwen', actualWinner: 'Aryna Sabalenka', endDate: '2024-01-27', sport: 'Tennis' },
  { question: 'French Open 2024 Women\'s Final: Iga Swiatek vs. Jasmine Paolini 2024-06-08', outcome0: 'Iga Swiatek', outcome1: 'Jasmine Paolini', actualWinner: 'Iga Swiatek', endDate: '2024-06-08', sport: 'Tennis' },

  // ── UFC / MMA ──────────────────────────────────────────────────────────────
  { question: 'UFC 300: Alex Pereira vs. Jamahal Hill 2024-04-13', outcome0: 'Alex Pereira', outcome1: 'Jamahal Hill', actualWinner: 'Alex Pereira', endDate: '2024-04-13', sport: 'UFC' },
  { question: 'UFC 302: Islam Makhachev vs. Dustin Poirier 2024-06-01', outcome0: 'Islam Makhachev', outcome1: 'Dustin Poirier', actualWinner: 'Islam Makhachev', endDate: '2024-06-01', sport: 'UFC' },
  { question: 'UFC 303: Alex Pereira vs. Jiri Prochazka 2024-06-29', outcome0: 'Alex Pereira', outcome1: 'Jiri Prochazka', actualWinner: 'Alex Pereira', endDate: '2024-06-29', sport: 'UFC' },
  { question: 'UFC 304: Belal Muhammad vs. Leon Edwards 2024-07-27', outcome0: 'Belal Muhammad', outcome1: 'Leon Edwards', actualWinner: 'Belal Muhammad', endDate: '2024-07-27', sport: 'UFC' },
  { question: 'UFC 309: Jon Jones vs. Stipe Miocic 2024-11-16', outcome0: 'Jon Jones', outcome1: 'Stipe Miocic', actualWinner: 'Jon Jones', endDate: '2024-11-16', sport: 'UFC' },
  { question: 'UFC 305: Dricus Du Plessis vs. Israel Adesanya 2024-08-17', outcome0: 'Dricus Du Plessis', outcome1: 'Israel Adesanya', actualWinner: 'Dricus Du Plessis', endDate: '2024-08-17', sport: 'UFC' },
  { question: 'UFC 298: Ilia Topuria vs. Alexander Volkanovski 2024-02-17', outcome0: 'Ilia Topuria', outcome1: 'Alexander Volkanovski', actualWinner: 'Ilia Topuria', endDate: '2024-02-17', sport: 'UFC' },
  { question: 'UFC 299: Sean O\'Malley vs. Marlon Vera 2024-03-09', outcome0: 'Sean O\'Malley', outcome1: 'Marlon Vera', actualWinner: 'Sean O\'Malley', endDate: '2024-03-09', sport: 'UFC' },
  { question: 'UFC 301: Alexandre Pantoja vs. Steve Erceg 2024-05-04', outcome0: 'Alexandre Pantoja', outcome1: 'Steve Erceg', actualWinner: 'Alexandre Pantoja', endDate: '2024-05-04', sport: 'UFC' },
  { question: 'UFC 300: Max Holloway vs. Justin Gaethje 2024-04-13', outcome0: 'Max Holloway', outcome1: 'Justin Gaethje', actualWinner: 'Max Holloway', endDate: '2024-04-13', sport: 'UFC' },

  // ── Esports ────────────────────────────────────────────────────────────────
  { question: 'LoL Worlds 2023 Final: T1 vs. Weibo Gaming 2023-11-19', outcome0: 'T1', outcome1: 'Weibo Gaming', actualWinner: 'T1', endDate: '2023-11-19', sport: 'Esports' },
  { question: 'LoL Worlds 2022 Final: DRX vs. T1 2022-11-05', outcome0: 'DRX', outcome1: 'T1', actualWinner: 'DRX', endDate: '2022-11-05', sport: 'Esports' },
  { question: 'LoL MSI 2024 Final: Bilibili Gaming vs. Gen.G 2024-05-19', outcome0: 'Bilibili Gaming', outcome1: 'Gen.G', actualWinner: 'Bilibili Gaming', endDate: '2024-05-19', sport: 'Esports' },
  { question: 'CS2 Major Copenhagen 2024 Final: FaZe Clan vs. Natus Vincere 2024-03-31', outcome0: 'FaZe Clan', outcome1: 'Natus Vincere', actualWinner: 'Natus Vincere', endDate: '2024-03-31', sport: 'Esports' },
  { question: 'Dota 2 TI12 Final: Gaimin Gladiators vs. Team Liquid 2023-10-29', outcome0: 'Gaimin Gladiators', outcome1: 'Team Liquid', actualWinner: 'Gaimin Gladiators', endDate: '2023-10-29', sport: 'Esports' },
  { question: 'Valorant Champions 2024 Final: EDward Gaming vs. LOUD 2024-08-24', outcome0: 'EDward Gaming', outcome1: 'LOUD', actualWinner: 'EDward Gaming', endDate: '2024-08-24', sport: 'Esports' },
  { question: 'LoL Worlds 2024 Final: T1 vs. Bilibili Gaming 2024-11-02', outcome0: 'T1', outcome1: 'Bilibili Gaming', actualWinner: 'Bilibili Gaming', endDate: '2024-11-02', sport: 'Esports' },
  { question: 'CS2 Major Shanghai 2024 Final: Spirit vs. Vitality 2024-09-22', outcome0: 'Spirit', outcome1: 'Vitality', actualWinner: 'Spirit', endDate: '2024-09-22', sport: 'Esports' },

  // ── NCAAB ──────────────────────────────────────────────────────────────────
  { question: 'NCAA Championship: UConn Huskies vs. Purdue Boilermakers 2024-04-08', outcome0: 'UConn Huskies', outcome1: 'Purdue Boilermakers', actualWinner: 'UConn Huskies', endDate: '2024-04-08', sport: 'NCAAB' },
  { question: 'NCAA Championship: UConn Huskies vs. San Diego State Aztecs 2023-04-03', outcome0: 'UConn Huskies', outcome1: 'San Diego State Aztecs', actualWinner: 'UConn Huskies', endDate: '2023-04-03', sport: 'NCAAB' },
  { question: 'NCAA Championship: Kansas Jayhawks vs. North Carolina Tar Heels 2022-04-04', outcome0: 'Kansas Jayhawks', outcome1: 'North Carolina Tar Heels', actualWinner: 'Kansas Jayhawks', endDate: '2022-04-04', sport: 'NCAAB' },
  { question: 'NCAA FF: UConn Huskies vs. Alabama Crimson Tide 2024-04-06', outcome0: 'UConn Huskies', outcome1: 'Alabama Crimson Tide', actualWinner: 'UConn Huskies', endDate: '2024-04-06', sport: 'NCAAB' },
  { question: 'NCAA FF: Purdue Boilermakers vs. NC State Wolfpack 2024-04-06', outcome0: 'Purdue Boilermakers', outcome1: 'NC State Wolfpack', actualWinner: 'Purdue Boilermakers', endDate: '2024-04-06', sport: 'NCAAB' },
  { question: 'NCAA FF: UConn Huskies vs. Miami Hurricanes 2023-04-01', outcome0: 'UConn Huskies', outcome1: 'Miami Hurricanes', actualWinner: 'UConn Huskies', endDate: '2023-04-01', sport: 'NCAAB' },
  { question: 'NCAA FF: San Diego State vs. Florida Atlantic 2023-04-01', outcome0: 'San Diego State Aztecs', outcome1: 'Florida Atlantic Owls', actualWinner: 'San Diego State Aztecs', endDate: '2023-04-01', sport: 'NCAAB' },
  { question: 'NCAA March Madness: NC State vs. Duke 2024-03-31', outcome0: 'NC State Wolfpack', outcome1: 'Duke Blue Devils', actualWinner: 'NC State Wolfpack', endDate: '2024-03-31', sport: 'NCAAB' },
  { question: 'NCAA March Madness: Princeton vs. Arizona 2023-03-23', outcome0: 'Princeton Tigers', outcome1: 'Arizona Wildcats', actualWinner: 'Princeton Tigers', endDate: '2023-03-23', sport: 'NCAAB' },
  { question: 'NCAAB: Duke Blue Devils vs. Kentucky Wildcats 2024-11-12', outcome0: 'Duke Blue Devils', outcome1: 'Kentucky Wildcats', actualWinner: 'Duke Blue Devils', endDate: '2024-11-12', sport: 'NCAAB' },

  // ── College Football ───────────────────────────────────────────────────────
  { question: 'CFP Championship: Michigan Wolverines vs. Washington Huskies 2024-01-08', outcome0: 'Michigan Wolverines', outcome1: 'Washington Huskies', actualWinner: 'Michigan Wolverines', endDate: '2024-01-08', sport: 'CFB' },
  { question: 'CFP Championship: Georgia Bulldogs vs. TCU Horned Frogs 2023-01-09', outcome0: 'Georgia Bulldogs', outcome1: 'TCU Horned Frogs', actualWinner: 'Georgia Bulldogs', endDate: '2023-01-09', sport: 'CFB' },
  { question: 'CFP Championship: Georgia Bulldogs vs. Alabama Crimson Tide 2022-01-10', outcome0: 'Georgia Bulldogs', outcome1: 'Alabama Crimson Tide', actualWinner: 'Georgia Bulldogs', endDate: '2022-01-10', sport: 'CFB' },
  { question: 'CFP SF Rose Bowl: Michigan vs. Alabama 2024-01-01', outcome0: 'Michigan Wolverines', outcome1: 'Alabama Crimson Tide', actualWinner: 'Michigan Wolverines', endDate: '2024-01-01', sport: 'CFB' },
  { question: 'CFP SF Sugar Bowl: Washington vs. Texas 2024-01-01', outcome0: 'Washington Huskies', outcome1: 'Texas Longhorns', actualWinner: 'Washington Huskies', endDate: '2024-01-01', sport: 'CFB' },
  { question: 'College Football: Ohio State vs. Michigan 2023-11-25', outcome0: 'Michigan Wolverines', outcome1: 'Ohio State Buckeyes', actualWinner: 'Michigan Wolverines', endDate: '2023-11-25', sport: 'CFB' },
  { question: 'College Football: Georgia vs. Alabama 2023-09-30', outcome0: 'Georgia Bulldogs', outcome1: 'Alabama Crimson Tide', actualWinner: 'Georgia Bulldogs', endDate: '2023-09-30', sport: 'CFB' },
  { question: 'College Football: USC vs. Notre Dame 2022-10-15', outcome0: 'USC Trojans', outcome1: 'Notre Dame Fighting Irish', actualWinner: 'USC Trojans', endDate: '2022-10-15', sport: 'CFB' },
]

export const SPORTS_LIST = ['All', 'NBA', 'NFL', 'MLB', 'NHL', 'Soccer', 'Tennis', 'UFC', 'Esports', 'NCAAB', 'CFB'] as const
export type SportFilter = typeof SPORTS_LIST[number]

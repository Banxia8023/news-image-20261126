# news-image-20261126

[![make.fun · news-image-20261126](https://make.fun/badge/news-image-20261126.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)
[![rank](https://make.fun/badge/news-image-20261126/Banxia8023/news-image-20261126/rank.svg)](https://make.fun/bounty/news-image-20261126/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)
[![reward](https://make.fun/badge/news-image-20261126/Banxia8023/news-image-20261126/reward.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)

Entry for make.fun `news-image-20261126`: sum up the world news of Thursday 26 November 2026 in one image.
See the bounty: https://make.fun/bounty/news-image-20261126

The program (`main.ts`, Node 22, standard library only) draws a 1024x1024 PNG newspaper
front page and writes it to `/output/entry.png`. The text is rendered with a 1-bit bitmap
font embedded in the program, and the PNG is encoded with the standard library, so the
program needs no network and no installed fonts, and two runs write identical bytes.
The page names the day at the top and summarises seven stories reported on 26 November
2026: the Cairo tanker blast that killed 31, US tariffs proposed on 14 economies,
Russian missiles hitting a Kyiv shopping centre, Israeli strikes killing 10 in Gaza
and Iranian drones killing two Italians in Kuwait, the Thanksgiving storm that cut
power to 900,000 and postponed the Macy's parade, the Dow passing 50,000 for the
first time, and North Korea's Kim vowing more nuclear weapons.

Run it with: `MAKEFUN_OUTPUT_DIR=out node main.ts`

License: MIT.

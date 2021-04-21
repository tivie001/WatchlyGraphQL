const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()
const movieData = [
    {
        title: "Godzilla vs. Kong",
        description: "In a time when monsters walk the Earth, humanity’s fight for its future sets Godzilla and Kong on a collision course that will see the two most powerful forces of nature on the planet collide in a spectacular battle for the ages.",
        image: "/pgqgaUx1cJb5oZQQ5v0tNARCeBp.jpg",
        releaseDate: new Date(("2021-03-24"))
    },
    {
        title: "Zack Snyder's Justice League",
        description: "Determined to ensure Superman's ultimate sacrifice was not in vain, Bruce Wayne aligns forces with Diana Prince with plans to recruit a team of metahumans to protect the world from an approaching threat of catastrophic proportions.",
        image: "/tnAuB8q5vv7Ax9UAEje5Xi4BXik.jpg",
        releaseDate: new Date("2021-03-18")
    },
    {
        title: "Mortal Kombat",
        description: "Washed-up MMA fighter Cole Young, unaware of his heritage, and hunted by Emperor Shang Tsung's best warrior, Sub-Zero, seeks out and trains with Earth's greatest champions as he prepares to stand against the enemies of Outworld in a high stakes battle for the universe.",
        image: "/8yhtzsbBExY8mUct2GOk4LDDuGH.jpg",
        releaseDate: new Date("2021-04-07")
    },
    {
        title: "Thunder Force",
        description: "In a world where supervillains are commonplace, two estranged childhood best friends reunite after one devises a treatment that gives them powers to protect their city.",
        image: "/279yOM4OQREL36B3SECnRxoB4MZ.jpg",
        releaseDate: new Date("2021-04-09")
    },
    {
        title: "Chaos Walking",
        description: "Two unlikely companions embark on a perilous adventure through the badlands of an unexplored planet as they try to escape a dangerous and disorienting reality, where all inner thoughts are seen and heard by everyone.",
        image: "/9kg73Mg8WJKlB9Y2SAJzeDKAnuB.jpg",
        releaseDate: new Date("2021-02-24")
    },
    {
        title: "Raya and the Last Dragon",
        description: "Long ago, in the fantasy world of Kumandra, humans and dragons lived together in harmony. But when an evil force threatened the land, the dragons sacrificed themselves to save humanity. Now, 500 years later, that same evil has returned and it’s up to a lone warrior, Raya, to track down the legendary last dragon to restore the fractured land and its divided people.",
        image: "/lPsD10PP4rgUGiGR4CCXA6iY0QQ.jpg",
        releaseDate: new Date("2021-03-03")
    },
    {
        title: "Mortal Kombat Legends: Scorpion's Revenge",
        description: "After the vicious slaughter of his family by stone-cold mercenary Sub-Zero, Hanzo Hasashi is exiled to the torturous Netherrealm. There, in exchange for his servitude to the sinister Quan Chi, he’s given a chance to avenge his family – and is resurrected as Scorpion, a lost soul bent on revenge. Back on Earthrealm, Lord Raiden gathers a team of elite warriors – Shaolin monk Liu Kang, Special Forces officer Sonya Blade and action star Johnny Cage – an unlikely band of heroes with one chance to save humanity. To do this, they must defeat Shang Tsung’s horde of Outworld gladiators and reign over the Mortal Kombat tournament.",
        image: "/4VlXER3FImHeFuUjBShFamhIp9M.jpg",
        releaseDate: new Date("2020-04-12")
    },
    {
        title: "Monster Hunter",
        description: "A portal transports Cpt. Artemis and an elite unit of soldiers to a strange world where powerful monsters rule with deadly ferocity. Faced with relentless danger, the team encounters a mysterious hunter who may be their only hope to find a way home.",
        image: "/1UCOF11QCw8kcqvce8LKOO6pimh.jpg",
        releaseDate: new Date("2020-12-03")
    },
    {
        title: "Twist",
        description: "A Dicken’s classic brought thrillingly up to date in the teeming heartland of modern London, where a group of street smart young hustlers plan the heist of the century for the ultimate payday.",
        image: "/29dCusd9PwHrbDqzxNG35WcpZpS.jpg",
        releaseDate: new Date("2021-01-22")
    },
    {
        title: "Tom & Jerry",
        description: "Tom the cat and Jerry the mouse get kicked out of their home and relocate to a fancy New York hotel, where a scrappy employee named Kayla will lose her job if she can’t evict Jerry before a high-class wedding at the hotel. Her solution? Hiring Tom to get rid of the pesky mouse.",
        image: "/6KErczPBROQty7QoIsaa6wJYXZi.jpg",
        releaseDate: new Date("2021-02-11")
    }
]
const watchlistData = [
    {
        title: "Godzilla vs. Kong",
        description: "In a time when monsters walk the Earth, humanity’s fight for its future sets Godzilla and Kong on a collision course that will see the two most powerful forces of nature on the planet collide in a spectacular battle for the ages.",
        image: "/pgqgaUx1cJb5oZQQ5v0tNARCeBp.jpg",
        releaseDate: new Date(("2021-03-24")),
        watched: false
    },
    {
        title: "Zack Snyder's Justice League",
        description: "Determined to ensure Superman's ultimate sacrifice was not in vain, Bruce Wayne aligns forces with Diana Prince with plans to recruit a team of metahumans to protect the world from an approaching threat of catastrophic proportions.",
        image: "/tnAuB8q5vv7Ax9UAEje5Xi4BXik.jpg",
        releaseDate: new Date("2021-03-18"),
        watched: false
    },
    {
        title: "Raya and the Last Dragon",
        description: "Long ago, in the fantasy world of Kumandra, humans and dragons lived together in harmony. But when an evil force threatened the land, the dragons sacrificed themselves to save humanity. Now, 500 years later, that same evil has returned and it’s up to a lone warrior, Raya, to track down the legendary last dragon to restore the fractured land and its divided people.",
        image: "/lPsD10PP4rgUGiGR4CCXA6iY0QQ.jpg",
        releaseDate: new Date("2021-03-03"),
        watched: false
    },
    {
        title: "Chaos Walking",
        description: "Two unlikely companions embark on a perilous adventure through the badlands of an unexplored planet as they try to escape a dangerous and disorienting reality, where all inner thoughts are seen and heard by everyone.",
        image: "/9kg73Mg8WJKlB9Y2SAJzeDKAnuB.jpg",
        releaseDate: new Date("2021-02-24"),
        watched: false
    },
    {
        title: "Mortal Kombat",
        description: "Washed-up MMA fighter Cole Young, unaware of his heritage, and hunted by Emperor Shang Tsung's best warrior, Sub-Zero, seeks out and trains with Earth's greatest champions as he prepares to stand against the enemies of Outworld in a high stakes battle for the universe.",
        image: "/8yhtzsbBExY8mUct2GOk4LDDuGH.jpg",
        releaseDate: new Date("2021-04-07"),
        watched: false
    }
]
const tvShowData = [
    {
        title: "The Falcon and the Winter Soldier",
        description: "Following the events of “Avengers: Endgame”, the Falcon, Sam Wilson and the Winter Soldier, Bucky Barnes team up in a global adventure that tests their abilities, and their patience.",
        image: "/6kbAMLteGO8yyewYau6bJ683sw7.jpg",
        releaseDate: new Date("2021-03-19"),
        voteAverage: "7.9"
    },
    {
        title: "The Good Doctor",
        description: "A young surgeon with Savant syndrome is recruited into the surgical unit of a prestigious hospital. The question will arise: can a person who doesn't have the ability to relate to people actually save their lives.",
        image: "/6tfT03sGp9k4c0J3dypjrI8TSAI.jpg",
        releaseDate: new Date("2017-09-25"),
        voteAverage: "8.6"
    },
    {
        title: "The Flash",
        description: "After a particle accelerator causes a freak storm, CSI Investigator Barry Allen is struck by lightning and falls into a coma. Months later he awakens with the power of super speed, granting him the ability to move through Central City like an unseen guardian angel. Though initially excited by his newfound powers, Barry is shocked to discover he is not the only \"meta-human\" who was created in the wake of the accelerator explosion -- and not everyone is using their new powers for good. Barry partners with S.T.A.R. Labs and dedicates his life to protect the innocent. For now, only a few close friends and associates know that Barry is literally the fastest man alive, but it won't be long before the world learns what Barry Allen has become...The Flash.",
        image: "/6tfT03sGp9k4c0J3dypjrI8TSAI.jpg",
        releaseDate: new Date("2014-10-07"),
        voteAverage: "7.7"
    },
    {
        title: "Invincible",
        description: "Mark Grayson is a normal teenager except for the fact that his father is the most powerful superhero on the planet. Shortly after his seventeenth birthday, Mark begins to develop powers of his own and enters into his father’s tutelage.",
        image: "/yDWJYRAwMNKbIYT8ZB33qy84uzO.jpg",
        releaseDate: new Date("2021-03-26"),
        voteAverage: "8.9"
    },
    {
        title: "Riverdale",
        description: "Set in the present, the series offers a bold, subversive take on Archie, Betty, Veronica and their friends, exploring the surreality of small-town life, the darkness and weirdness bubbling beneath Riverdale’s wholesome facade.",
        image: "/wRbjVBdDo5qHAEOVYoMWpM58FSA.jpg",
        releaseDate: new Date("2017-01-26"),
        voteAverage: "8.6"
    },
    {
        title: "Grey's Anatomy",
        description: "Follows the personal and professional lives of a group of doctors at Seattle’s Grey Sloan Memorial Hospital.",
        image: "/clnyhPqj1SNgpAdeSS6a6fwE6Bo.jpg",
        releaseDate: new Date("2005-03-27"),
        voteAverage: "8.2"
    },
    {
        title: "Lucifer",
        description: "Bored and unhappy as the Lord of Hell, Lucifer Morningstar abandoned his throne and retired to Los Angeles, where he has teamed up with LAPD detective Chloe Decker to take down criminals. But the longer he's away from the underworld, the greater the threat that the worst of humanity could escape.",
        image: "/clnyhPqj1SNgpAdeSS6a6fwE6Bo.jpg",
        releaseDate: new Date("2016-01-25"),
        voteAverage: "8.5"
    },
    {
        title: "The Walking Dead",
        description: "Sheriff's deputy Rick Grimes awakens from a coma to find a post-apocalyptic world dominated by flesh-eating zombies. He sets out to find his family and encounters many other survivors along the way.",
        image: "/rqeYMLryjcawh2JeRpCVUDXYM5b.jpg",
        releaseDate: new Date("2010-10-31"),
        voteAverage: "8.1"
    },
    {
        title: "WandaVision",
        description: "Wanda Maximoff and Vision—two super-powered beings living idealized suburban lives—begin to suspect that everything is not as it seems.",
        image: "/glKDfE6btIRcVB5zrjspRIs4r52.jpg",
        releaseDate: new Date("2021-01-15"),
        voteAverage: "8.4"
    },
    {
        title: "Who Killed Sara?",
        description: "Hell-bent on exacting revenge and proving he was framed for his sister's murder, Álex sets out to unearth much more than the crime's real culprit.",
        image: "/o7uk5ChRt3quPIv8PcvPfzyXdMw.jpg",
        releaseDate: new Date("2021-03-24"),
        voteAverage: "7.8"
    }
]

async function main() {
    console.log(`Start seeding ...`)
    for (const move of movieData) {
        const movie = await prisma.movie.create({
            data: move,
        })
        console.log(`Created movie with id: ${movie.id}`)
    }
    for (const move of watchlistData) {
        const movie = await prisma.watchlist.create({
            data: move,
        })
        console.log(`Created watchlist with id: ${movie.id}`)
    }
    for (const tv of tvShowData) {
        const show = await prisma.tvshow.create({
            data: tv,
        })
        console.log(`Created tvshow with id: ${show.id}`)
    }
    console.log(`Seeding finished.`)
}

main()
    .catch(e => {
        throw e
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

export async function POST() {
  // Simulate AI theme generation
  const themes = [
    "Jungle Safari Adventure with Lost Explorers",
    "Ghost Town Road Trip Through Nevada",
    "Space Station Mystery Among Strangers",
    "Medieval Castle Quest with Knights",
    "Underwater Treasure Hunt with Divers",
    "Time Travel Classroom Adventure",
    "Alien Road Trip Across America",
    "Secret Santa Gone Wrong Office Party",
    "Dinosaur Expedition Team Building",
    "Pirate Ship Crew Bonding Experience",
    "Wizard School Study Group",
    "Zombie Apocalypse Survival Team",
    "Arctic Research Station Isolation",
    "Carnival Workers Summer Adventure",
    "Detective Agency Mystery Solving",
  ]

  const randomTheme = themes[Math.floor(Math.random() * themes.length)]

  return Response.json({ theme: randomTheme })
}

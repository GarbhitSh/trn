// Free Graphics APIs for generating board game graphics

export interface GraphicsOptions {
  theme: string
  style?: "cartoon" | "realistic" | "pixel" | "minimalist"
  size?: "small" | "medium" | "large"
  format?: "png" | "jpg" | "svg"
}

export interface GeneratedImage {
  url: string
  alt: string
  width: number
  height: number
}

// 1. Unsplash API (Free with attribution)
export async function generateUnsplashImage(options: GraphicsOptions): Promise<GeneratedImage | null> {
  try {
    const query = encodeURIComponent(options.theme)
    const size = options.size === "large" ? "1600x900" : options.size === "medium" ? "800x600" : "400x300"

    // Using Unsplash Source API (no API key required)
    const url = `https://source.unsplash.com/${size}/?${query}`

    return {
      url,
      alt: `${options.theme} themed background`,
      width: Number.parseInt(size.split("x")[0]),
      height: Number.parseInt(size.split("x")[1]),
    }
  } catch (error) {
    console.error("Error generating Unsplash image:", error)
    return null
  }
}

// 2. Picsum (Lorem Picsum) - Random images
export async function generatePicsumImage(options: GraphicsOptions): Promise<GeneratedImage | null> {
  try {
    const width = options.size === "large" ? 1600 : options.size === "medium" ? 800 : 400
    const height = options.size === "large" ? 900 : options.size === "medium" ? 600 : 300

    const url = `https://picsum.photos/${width}/${height}?random=${Date.now()}`

    return {
      url,
      alt: `Random ${options.theme} themed image`,
      width,
      height,
    }
  } catch (error) {
    console.error("Error generating Picsum image:", error)
    return null
  }
}

// 3. DiceBear API - Avatar/Character generation (Free)
export async function generateDiceBearAvatar(options: GraphicsOptions): Promise<GeneratedImage | null> {
  try {
    const styles = [
      "adventurer",
      "avataaars",
      "big-ears",
      "bottts",
      "croodles",
      "fun-emoji",
      "icons",
      "identicon",
      "initials",
      "lorelei",
      "micah",
      "miniavs",
      "open-peeps",
      "personas",
      "pixel-art",
      "shapes",
    ]
    const style = styles[Math.floor(Math.random() * styles.length)]
    const seed = encodeURIComponent(options.theme)
    const size = options.size === "large" ? 200 : options.size === "medium" ? 100 : 50

    const url = `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&size=${size}`

    return {
      url,
      alt: `${options.theme} character avatar`,
      width: size,
      height: size,
    }
  } catch (error) {
    console.error("Error generating DiceBear avatar:", error)
    return null
  }
}

// 4. Placeholder.com - Simple placeholder images
export async function generatePlaceholderImage(options: GraphicsOptions): Promise<GeneratedImage | null> {
  try {
    const width = options.size === "large" ? 1600 : options.size === "medium" ? 800 : 400
    const height = options.size === "large" ? 900 : options.size === "medium" ? 600 : 300
    const colors = ["FF6B6B", "4ECDC4", "45B7D1", "96CEB4", "FFEAA7", "DDA0DD", "98D8C8", "F7DC6F"]
    const bgColor = colors[Math.floor(Math.random() * colors.length)]
    const textColor = "FFFFFF"

    const text = encodeURIComponent(options.theme.substring(0, 20))
    const url = `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${text}`

    return {
      url,
      alt: `${options.theme} placeholder`,
      width,
      height,
    }
  } catch (error) {
    console.error("Error generating placeholder image:", error)
    return null
  }
}

// 5. Robohash - Robot/Monster avatars (Free)
export async function generateRobohashImage(options: GraphicsOptions): Promise<GeneratedImage | null> {
  try {
    const sets = ["set1", "set2", "set3", "set4"] // Different robot styles
    const set = sets[Math.floor(Math.random() * sets.length)]
    const size = options.size === "large" ? "300x300" : options.size === "medium" ? "200x200" : "100x100"
    const seed = encodeURIComponent(options.theme)

    const url = `https://robohash.org/${seed}?set=${set}&size=${size}`

    return {
      url,
      alt: `${options.theme} robot character`,
      width: Number.parseInt(size.split("x")[0]),
      height: Number.parseInt(size.split("x")[1]),
    }
  } catch (error) {
    console.error("Error generating Robohash image:", error)
    return null
  }
}

// 6. Adorable Avatars (Free)
export async function generateAdorableAvatar(options: GraphicsOptions): Promise<GeneratedImage | null> {
  try {
    const size = options.size === "large" ? 400 : options.size === "medium" ? 200 : 100
    const seed = encodeURIComponent(options.theme)

    const url = `https://api.adorable.io/avatars/${size}/${seed}.png`

    return {
      url,
      alt: `${options.theme} adorable avatar`,
      width: size,
      height: size,
    }
  } catch (error) {
    console.error("Error generating Adorable avatar:", error)
    return null
  }
}

// Main function to generate images with fallbacks
export async function generateGameGraphics(options: GraphicsOptions): Promise<GeneratedImage[]> {
  const images: GeneratedImage[] = []

  try {
    // Try multiple APIs for variety
    const generators = [
      generateUnsplashImage,
      generateDiceBearAvatar,
      generateRobohashImage,
      generatePlaceholderImage,
      generatePicsumImage,
    ]

    for (const generator of generators) {
      try {
        const image = await generator(options)
        if (image) {
          images.push(image)
        }
      } catch (error) {
        console.error(`Error with generator:`, error)
      }
    }

    return images
  } catch (error) {
    console.error("Error generating game graphics:", error)
    return []
  }
}

// Utility function to get a single random image
export async function getRandomGameImage(theme: string): Promise<string> {
  const options: GraphicsOptions = {
    theme,
    style: "cartoon",
    size: "medium",
  }

  const images = await generateGameGraphics(options)
  if (images.length > 0) {
    const randomImage = images[Math.floor(Math.random() * images.length)]
    return randomImage.url
  }

  // Fallback to a simple placeholder
  return `/placeholder.svg?height=400&width=600&text=${encodeURIComponent(theme)}`
}

export const ALL_SERIES_QUERY = `
  *[_type == "series"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    year,
    mode,
    description,
    "coverImage": coverImage {
      asset->{ url, metadata { lqip, dimensions } },
      hotspot
    },
    "photoCount": count(photos)
  }
`

export const SERIES_BY_SLUG_QUERY = `
  *[_type == "series" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    year,
    mode,
    description,
    "photos": photos[]-> {
      _id,
      title,
      weight,
      year,
      dimensions,
      availableAsPrint,
      altText,
      "image": image {
        asset->{ url, metadata { lqip, dimensions } },
        hotspot
      }
    }
  }
`

export const ALL_PRINTS_QUERY = `
  *[_type == "print"] {
    _id,
    editionSize,
    editionsSold,
    paper,
    technique,
    dimensions,
    colorMode,
    format,
    "photo": photo-> {
      title,
      altText,
      "image": image { asset->{ url, metadata { lqip, dimensions } } }
    }
  }
`

export const ABOUT_QUERY = `
  *[_type == "about"][0] {
    statement,
    bio,
    pullQuote,
    clients,
    practice,
    "portrait": portrait {
      asset->{ url, metadata { lqip, dimensions } },
      hotspot
    }
  }
`

export const CONTACT_QUERY = `*[_type == "contact"][0]`

export const FEATURED_SERIES_QUERY = `
  *[_type == "series"] | order(order asc)[0..2] {
    _id,
    title,
    "slug": slug.current,
    year,
    mode,
    "coverImage": coverImage {
      asset->{ url, metadata { lqip, dimensions } },
      hotspot
    }
  }
`

require("dotenv").config({
  path: ".env"
})

module.exports = {
  siteMetadata: {
    siteTitle: "sitr.us",
    siteTitleAlt: "sitr.us",
    siteHeadline: "posts by Jesse Hallett",
    siteUrl: "https://sitr.us/",
    siteDescription: "posts by Jesse Hallett",
    siteLanguage: "en",
    author: "@hallettj",
    externalLinks: [
      {
        name: "Github",
        url: "https://github.com/hallettj/"
      },
      {
        name: "Twitter",
        url: "https://twitter.com/hallettj/"
      },
      {
        name: "Email",
        url: "mailto:jesse@sitr.us"
      }
    ],
    navigation: [
      {
        title: "Blog",
        slug: "/blog"
      },
      {
        title: "About",
        slug: "/about"
      }
    ],
    showLineNumbers: false
  },
  plugins: [
    {
      resolve: "@lekoarts/gatsby-theme-minimal-blog",
      options: {}
    },
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: process.env.GOOGLE_ANALYTICS_ID
      }
    },
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: "minimal-blog - @lekoarts/gatsby-theme-minimal-blog",
        short_name: "minimal-blog",
        description:
          "Typography driven, feature-rich blogging theme with minimal aesthetics. Includes tags/categories support and extensive features for code blocks such as live preview, line numbers, and code highlighting.",
        start_url: "/",
        background_color: "#fff",
        theme_color: "#6B46C1",
        display: "standalone",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    },
    "gatsby-plugin-offline",
    "gatsby-plugin-netlify"
    // "gatsby-plugin-webpack-bundle-analyser-v2",
  ]
}

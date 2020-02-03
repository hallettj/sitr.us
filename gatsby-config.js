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
      options: {
        feed: {
          title: `sitr.us - posts by Jesse Hallett`,
          link: "https://feeds.feedburner.com/hallettj"
        }
      }
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
        name: "sitr.us\u2014posts by Jesse Hallett",
        short_name: "sitr.us",
        description: "Jesse Hallett's personal blog",
        start_url: "/",
        background_color: "#fff",
        theme_color: "#cb9d06",
        display: "standalone",
        icon: "src/images/icon.svg"
      }
    },
    "gatsby-plugin-offline",
    "gatsby-plugin-netlify"
    // "gatsby-plugin-webpack-bundle-analyser-v2",
  ]
}

// @ts-check

// If this external import is changed, due to my CSP settings it is necessary to
// update the URL and hash in the modulepreload in comments.html, and to set
// a matching hash in the allowed_domains script-src configuration.
import DOMPurify from "https://unpkg.com/dompurify@3.2.3/dist/purify.es.mjs";
import {
  arrayOf,
  attribute,
  date,
  klass,
  nullable,
  number,
  property,
  string,
} from "./parsers.mjs";

class MastodonComments extends HTMLElement {
  constructor() {
    super();
    this.activated = false;
  }

  connectedCallback() {
    whenVisible(this).then(() => this.loadComments());
  }

  async loadComments() {
    if (this.activated) return;
    this.activated = true;

    // TODO: find a loading element child, or read loading message from
    // attribute
    const loading = document.createElement("header");
    const heading = document.createElement("h3");
    heading.innerText = "Loading comments...";
    loading.appendChild(heading);
    this.innerHTML = "";
    this.appendChild(loading);

    const tootUrl = attribute(this, "src", string);
    const config = parseTootUrl(tootUrl);
    const statuses = await fetchComments(config);

    this.innerHTML = "";
    if (statuses.length > 0) {
      renderToots(this, config, statuses, config.tootId);
    } else {
      const noComments = document.createElement("p");
      noComments.innerText = "Oh, there are no comments.";
      this.appendChild(noComments);
    }
  }
}

customElements.define("mastodon-comments", MastodonComments);

class Status {
  /**
   * @param {unknown} input
   */
  constructor(input) {
    this.account = property(input, "account", klass(Account));
    this.content = property(input, "content", string);
    this.created_at = property(input, "created_at", date);
    this.favourites_count = property(input, "favourites_count", number);
    this.id = property(input, "id", string);
    this.in_reply_to_id = property(input, "in_reply_to_id", nullable(string));
    this.emojis = property(input, "emojis", arrayOf(klass(Emoji)));
    this.mediaAttachments = property(
      input,
      "media_attachments",
      arrayOf(klass(MediaAttachment)),
    );
    this.url = property(input, "url", string);
  }

  contentHtml() {
    return DOMPurify.sanitize(emojify(this.content, this.emojis));
  }

  displayNameHtml() {
    if (this.account.display_name) {
      return emojify(escapeHtml(this.account.display_name), this.emojis);
    } else {
      return this.account.username;
    }
  }
}

class Account {
  /**
   * @param {unknown} input
   */
  constructor(input) {
    this.acct = property(input, "acct", string);
    this.avatar = property(input, "avatar", string);
    this.avatar_static = property(input, "avatar_static", string);
    this.display_name = property(input, "display_name", nullable(string));
    this.username = property(input, "username", string);
    this.url = property(input, "url", string);
  }

  instance() {
    if (this.acct.includes("@")) {
      return this.acct.split("@")[1];
    }
  }
}

/**
 * @typedef {Object} MediaMeta
 * @property {number} aspect
 * @property {number} width
 * @property {number} height
 * @property {string} size
 */

/**
 * @typedef {Object} MediaMetaMap
 * @property {MediaMeta} original
 * @property {MediaMeta} small
 */

class MediaAttachment {
  /**
   * @param {unknown} input
   */
  constructor(input) {
    this.id = property(input, "id", string);
    this.description = property(input, "description", nullable(string));
    this.type = property(input, "type", string);
    this.url = property(input, "url", string);
    this.preview_url = property(input, "preview_url", nullable(string));
    this.meta = property(input, "meta", MediaAttachment.metaParser);
  }

  /**
   * @param {unknown} input
   * @returns {{ success: true, value: MediaMetaMap } | { success: false, error: string }}
   */
  static metaParser(input) {
    if (input && typeof input === "object") {
      // @ts-ignore: type casting the return value
      return { success: true, value: input };
    } else {
      return { success: false, error: "an object with size metadata" };
    }
  }
}

class Emoji {
  /**
   * @param {unknown} input
   */
  constructor(input) {
    this.url = property(input, "url", string);
    this.static_url = property(input, "static_url", string);
    this.shortcode = property(input, "shortcode", string);
  }
}

/**
 * @param {string} input
 * @param {Emoji[]} emojis
 */
function emojify(input, emojis) {
  let output = input;

  for (const emoji of emojis) {
    const picture = document.createElement("picture");

    const source = document.createElement("source");
    source.setAttribute("srcset", escapeHtml(emoji.url));
    source.setAttribute("media", "(prefers-reduced-motion: no-preference)");

    const img = document.createElement("img");
    img.className = "emoji";
    img.setAttribute("src", escapeHtml(emoji.static_url));
    img.setAttribute("alt", `:${emoji.shortcode}:`);
    img.setAttribute("title", `:${emoji.shortcode}:`);
    img.setAttribute("width", "20");
    img.setAttribute("height", "20");

    picture.appendChild(source);
    picture.appendChild(img);

    output = output.replace(`:${emoji.shortcode}:`, picture.outerHTML);
  }

  return output;
}

/**
 * @param {string} unsafe
 */
function escapeHtml(unsafe) {
  const element = document.createElement("div");
  element.innerText = unsafe;
  return element.innerHTML;
}

/**
 * @typedef {Object} Config
 * @property {string} origin
 * @property {string} host
 * @property {string} user
 * @property {string} tootId
 */

/**
 * @param {string} url
 * @returns {Config}
 */
function parseTootUrl(url) {
  const pathPattern = /@(?<user>[^\/]+)\/(?<tootId>[^\/]+)/;
  const parsed = new URL(url);
  const groups = pathPattern.exec(parsed.pathname)?.groups;
  if (!groups) {
    throw new Error(`unable to parse toot URL: ${url}`);
  }
  const { user, tootId } = groups;
  return {
    origin: parsed.origin,
    host: parsed.hostname,
    user,
    tootId,
  };
}

/**
 * @param {Element} element
 * @returns {Promise<void>}
 */
function whenVisible(element) {
  return new Promise((resolve) => {
    const observer = new IntersectionObserver((entries, observer) => {
      if (entries.some((entry) => entry.intersectionRatio > 0)) {
        observer.disconnect();
        resolve();
      }
    }, { root: null, threshold: 0.25 });
    observer.observe(element);
  });
}

/**
 * @param {Config} config
 * @returns {Promise<Status[]>}
 */
async function fetchComments(config) {
  const response = await fetch(
    `${config.origin}/api/v1/statuses/${config.tootId}/context`,
  );
  const data = await response.json();
  const descendants = data?.descendants;

  console.log("data from Mastodon", data);

  const statuses = (descendants && Array.isArray(descendants))
    ? descendants.map((s) => new Status(s))
    : null;

  if (statuses === null) {
    throw new Error("invalid response from Mastodon", data);
  }

  return statuses;
}

/**
 * @param {HTMLElement} container
 * @param {Config} config
 * @param {Status[]} toots
 * @param {string} parentTootId
 * @param {number} [depth]
 */
function renderToots(container, config, toots, parentTootId, depth) {
  const filteredToots = toots.filter((toot) =>
    toot.in_reply_to_id === parentTootId
  ).sort((a, b) => {
    if (a < b) return -1;
    else if (b < a) return 1;
    else return 0;
  });
  for (const toot of filteredToots) {
    container.appendChild(renderToot(config, toot));

    if (!toots.some((t) => t.in_reply_to_id === toot.id)) {
      continue;
    }

    const nestedDepth = (depth || 0) + 1;
    let nestedContainer = container;
    if (nestedDepth <= 4) {
      const nesting = document.createElement("div");
      nesting.className = `comment-indent indent-level-${nestedDepth}`;
      nestedContainer = nesting;
      container.appendChild(nestedContainer);
    }

    renderToots(nestedContainer, config, toots, toot.id, nestedDepth);
  }
}

/**
 * @param {Config} config
 * @param {Status} toot
 * @returns {HTMLElement}
 */
function renderToot(config, toot) {
  const instance = toot.account.instance() || config.host;
  const isReply = toot.in_reply_to_id !== config.tootId;
  const isOP = toot.account.acct === config.user;

  const avatarSource = document.createElement("source");
  avatarSource.setAttribute("srcset", toot.account.avatar);
  avatarSource.setAttribute("media", "(prefers-reduced-motion: no-preference)");

  const avatarImg = document.createElement("img");
  avatarImg.className = "avatar";
  avatarImg.setAttribute("src", toot.account.avatar_static);
  avatarImg.setAttribute(
    "alt",
    `@${toot.account.username}@${instance} avatar`,
  );

  const avatarPicture = document.createElement("picture");
  avatarPicture.appendChild(avatarSource);
  avatarPicture.appendChild(avatarImg);

  const avatar = document.createElement("a");
  avatar.className = "avatar-link";
  avatar.setAttribute("href", toot.account.url);
  avatar.setAttribute("rel", "external nofollow");
  avatar.setAttribute(
    "title",
    `View profile at @${toot.account.username}@${instance}`,
  );
  avatar.appendChild(avatarPicture);

  const instanceBadge = document.createElement("a");
  instanceBadge.className = "instance";
  instanceBadge.setAttribute("href", toot.account.url);
  instanceBadge.setAttribute(
    "title",
    `@${toot.account.username}@${instance}`,
  );
  instanceBadge.setAttribute("rel", "external nofollow");
  instanceBadge.textContent = `@${toot.account.username}@${instance}`;

  const display = document.createElement("span");
  display.className = "display";
  display.setAttribute("itemprop", "author");
  display.setAttribute("itemtype", "http://schema.org/Person");
  display.innerHTML = toot.displayNameHtml();

  const permalink = document.createElement("a");
  permalink.setAttribute("href", toot.url);
  permalink.setAttribute("itemprop", "url");
  permalink.setAttribute("title", `View comment at ${instance}`);
  permalink.setAttribute("rel", "external nofollow");
  permalink.textContent = new Date(toot.created_at).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });

  const timestamp = document.createElement("time");
  timestamp.setAttribute("datetime", toot.created_at.toISOString());
  timestamp.appendChild(permalink);

  const faves = document.createElement("a");
  faves.className = "faves";
  faves.setAttribute("href", `${toot.url}/favourites`);
  faves.setAttribute("title", `Favorites from ${instance}`);
  if (toot.favourites_count == 1) {
    faves.textContent = `${toot.favourites_count} Like`;
  } else {
    faves.textContent = `${toot.favourites_count} Likes`;
  }

  const headerInfo = document.createElement("div");
  headerInfo.className = "header-info";
  headerInfo.appendChild(display);
  headerInfo.appendChild(instanceBadge);
  headerInfo.appendChild(timestamp);

  // Disable like counts for now
  // if (toot.favourites_count > 0) {
  //   headerInfo.appendChild(faves);
  // }

  const header = document.createElement("header");
  header.className = "header";
  header.appendChild(avatar);
  header.appendChild(headerInfo);

  const main = document.createElement("main");
  main.setAttribute("itemprop", "text");
  main.innerHTML = toot.contentHtml();

  const attachments = document.createElement("footer");
  toot.mediaAttachments.flatMap((media) => {
    const srcUrl = media.preview_url || media.url;
    if (media.type === "image") {
      const img = document.createElement("img");
      img.setAttribute("src", srcUrl);
      if (media.description) {
        img.setAttribute("alt", media.description);
      }
      return [img];
    } else {
      return [];
    }
  }).forEach((elem) => attachments.appendChild(elem));

  const comment = document.createElement("article");
  comment.id = `comment-${toot.id}`;
  comment.className = isReply ? "comment comment-reply" : "comment";
  comment.setAttribute("itemprop", "comment");
  comment.setAttribute("itemtype", "http://schema.org/Comment");
  comment.appendChild(header);
  comment.appendChild(main);
  if (toot.mediaAttachments.length > 0) {
    comment.appendChild(attachments);
  }

  if (isOP) {
    comment.classList.add("op");

    avatar.classList.add("op");
    avatar.setAttribute(
      "title",
      "Blog post author; " + avatar.getAttribute("title"),
    );

    instanceBadge.classList.add("op");
    instanceBadge.setAttribute(
      "title",
      "Blog post author: " + instanceBadge.getAttribute("title"),
    );
  }

  return comment;
}

/**
 * FLOATING TABLE OF CONTENTS
 *
 * Builds an on-page table of contents from the article's section headings.
 * Keeps the entry for the heading currently in view highlighted as the reader
 * scrolls (a "scrollspy").
 *
 * The TOC is built client-side, so it does not depend on Antora rendering
 * a TOC via its `toc` attribute.
 *
 * If the page has too few headings to be worth a contents list, the aside
 * is left empty. Otherwise, h2 and h3 sections are listed. Unless the TOC
 * list ends up being very long, in which case only h2 sections are shown.
 *
 * Wrapped in a block so its `const`/`let` bindings stay local: the build
 * concatenates every `src/js/*.js` into one `site.js`, and block scope keeps
 * these files from colliding without needing an IIFE.
 */
{
  const COLLAPSE_THRESHOLD = 20

  const init = () => {
    const aside = document.querySelector('.TOC')
    if (!aside) return

    const doc = document.querySelector('.DOCUMENT')
    if (!doc) return

    /* Candidate headings, in document order. Only headings with an id can be
    linked to, so anything without one is skipped. */
    let headings = [...doc.querySelectorAll('h2[id], h3[id]')].filter((h) => h.id)

    /* Below two entries a contents list is pointless; leave the aside empty. */
    if (headings.length < 2) return

    /* If the full h2+h3 list would be too long, drop to h2-only. */
    if (headings.length >= COLLAPSE_THRESHOLD) {
      headings = headings.filter((h) => h.tagName === 'H2')
      if (headings.length < 2) return
    }

    buildList(aside, headings)
    spy(aside, headings)
  }

  /* Render the nested list. h3 entries are wrapped in a child <ul> hung off the
  most recent h2. Consecutive h3s with no preceding h2 fall back to top level. */
  const buildList = (aside, headings) => {
    const title = document.createElement('div')
    title.className = 'TOC__Title'
    title.textContent = aside.getAttribute('data-title') || 'On this page'
    aside.append(title)

    const root = document.createElement('ul')
    root.className = 'TOC__List'

    for (const heading of headings) {
      const item = document.createElement('li')
      const link = document.createElement('a')
      link.href = `#${heading.id}`
      link.textContent = heading.textContent
      link.dataset.tocTarget = heading.id
      item.append(link)

      if (heading.tagName === 'H3' && root.lastElementChild) {
        let sublist = root.lastElementChild.querySelector('ul')
        if (!sublist) {
          sublist = document.createElement('ul')
          root.lastElementChild.append(sublist)
        }
        sublist.append(item)
      } else {
        root.append(item)
      }
    }

    aside.append(root)
  }

  /* Highlight the entry for the heading nearest the top of the viewport. Uses an
  IntersectionObserver to track which headings are on screen. The topmost
  visible one (or, when none is visible, the last one scrolled past) wins. */
  const spy = (aside, headings) => {
    const links = new Map(
      [...aside.querySelectorAll('a[data-toc-target]')].map((a) => [
        a.dataset.tocTarget,
        a
      ])
    )

    const visible = new Set()

    const setActive = () => {
      /* Prefer the topmost heading currently in view; otherwise the last
      heading scrolled above the viewport; otherwise (at the very top of the
      page) the first entry, so the reader's place is always marked. */
      const current =
        headings.find((h) => visible.has(h.id)) ??
        headings.findLast((h) => h.getBoundingClientRect().top < 1) ??
        headings[0]

      for (const [id, link] of links) {
        link.parentNode.classList.toggle('is-active', id === current.id)
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        setActive()
      },
      {
        /* A negative bottom margin means a heading counts as "in view" only
        once it has scrolled into the top portion of the viewport. */
        rootMargin: '0px 0px -70% 0px',
        threshold: 0
      }
    )

    for (const heading of headings) observer.observe(heading)
    setActive()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
}

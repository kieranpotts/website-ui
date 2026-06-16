/**
 * FLOATING TABLE OF CONTENTS
 *
 * Builds an on-page table of contents from the article's section headings and
 * keeps the entry for the heading currently in view highlighted as the reader
 * scrolls (a "scrollspy").
 *
 * The TOC is built client-side so the theme stays self-contained – no Antora
 * `toc` attribute or server-side data is required. The container is an empty
 * `<aside class="TOC">` rendered by `toc.hbs`; this script fills it in. If the
 * page has too few headings to be worth a contents list, the aside is left
 * empty (and so stays hidden – see `.TOC:empty` in `_components.css`).
 *
 * Depth: section (h2) and subsection (h3) headings are listed, nested. But a
 * long page with many subsections makes for an unwieldy list, so if h2 + h3
 * together would run to 15 or more entries, only the h2 headings are listed.
 *
 * Placement and visibility (desktop-only, floated far right, only when there is
 * room beside the centered content column) are handled entirely in CSS.
 */
;(function () {
  'use strict'

  var COLLAPSE_THRESHOLD = 15

  function init () {
    var aside = document.querySelector('.TOC')
    if (!aside) return

    var doc = document.querySelector('.DOCUMENT')
    if (!doc) return

    /* Candidate headings, in document order. Only headings with an id can be
    linked to, so anything without one is skipped. */
    var all = [].slice.call(doc.querySelectorAll('h2[id], h3[id]'))
    var headings = all.filter(function (h) { return h.id })

    /* Below two entries a contents list is pointless; leave the aside empty. */
    if (headings.length < 2) return

    /* If the full h2+h3 list would be too long, drop to h2-only. */
    if (headings.length >= COLLAPSE_THRESHOLD) {
      headings = headings.filter(function (h) { return h.tagName === 'H2' })
      if (headings.length < 2) return
    }

    buildList(aside, headings)
    spy(aside, headings)
  }

  /* Render the nested list. h3 entries are wrapped in a child <ul> hung off the
  most recent h2; consecutive h3s with no preceding h2 fall back to top level. */
  function buildList (aside, headings) {
    var title = document.createElement('div')
    title.className = 'TOC__Title'
    title.textContent = aside.getAttribute('data-title') || 'On this page'
    aside.appendChild(title)

    var root = document.createElement('ul')
    root.className = 'TOC__List'

    var sublist = null
    headings.forEach(function (h) {
      var item = document.createElement('li')
      var link = document.createElement('a')
      link.href = '#' + h.id
      link.textContent = h.textContent
      link.setAttribute('data-toc-target', h.id)
      item.appendChild(link)

      if (h.tagName === 'H3' && root.lastElementChild) {
        sublist = root.lastElementChild.querySelector('ul')
        if (!sublist) {
          sublist = document.createElement('ul')
          root.lastElementChild.appendChild(sublist)
        }
        sublist.appendChild(item)
      } else {
        root.appendChild(item)
        sublist = null
      }
    })

    aside.appendChild(root)
  }

  /* Highlight the entry for the heading nearest the top of the viewport. Uses an
  IntersectionObserver to track which headings are on screen; the topmost
  visible one (or, when none is visible, the last one scrolled past) wins. */
  function spy (aside, headings) {
    var links = {}
    ;[].slice.call(aside.querySelectorAll('a[data-toc-target]')).forEach(function (a) {
      links[a.getAttribute('data-toc-target')] = a
    })

    var visible = {}

    function setActive () {
      var current = null
      /* Prefer the topmost heading currently in view. */
      headings.forEach(function (h) {
        if (visible[h.id] && current === null) current = h.id
      })
      /* If nothing is in view (e.g. mid-section), keep the last heading whose
      top has scrolled above the viewport. */
      if (current === null) {
        headings.forEach(function (h) {
          if (h.getBoundingClientRect().top < 1) current = h.id
        })
      }
      /* At the very top of the page, before the first heading has scrolled up,
      default to the first entry so the reader's place is always marked. */
      if (current === null) current = headings[0].id
      Object.keys(links).forEach(function (id) {
        links[id].parentNode.classList.toggle('is-active', id === current)
      })
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        visible[entry.target.id] = entry.isIntersecting
      })
      setActive()
    }, {
      /* A negative bottom margin means a heading counts as "in view" only once
      it has scrolled into the top portion of the viewport. */
      rootMargin: '0px 0px -70% 0px',
      threshold: 0
    })

    headings.forEach(function (h) { observer.observe(h) })
    setActive()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()

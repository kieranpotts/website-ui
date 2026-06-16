/**
 * MOBILE NAV MENU
 *
 * On narrow viewports the primary menu collapses behind a burger button (see
 * `.NavBar__Toggle` in `_components.css`). This script toggles the menu open
 * and closed and keeps `aria-expanded` in sync for assistive technology.
 *
 * The button is hidden by CSS at wide viewports, where the menu is always shown
 * inline; there the `is-open` state is inert. The menu is closed again when a
 * link inside it is followed, when focus leaves the bar, or on the Escape key,
 * so it never lingers open over the page.
 */
;(function () {
  'use strict'

  function init () {
    var toggle = document.querySelector('.NavBar__Toggle')
    var menu = document.getElementById('nav-menu')
    if (!toggle || !menu) return

    var navbar = toggle.closest('.NavBar')

    function setOpen (open) {
      menu.classList.toggle('is-open', open)
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true')
    })

    /* Close after a menu link is chosen. */
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false)
    })

    /* Close on Escape, returning focus to the button. */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false)
        toggle.focus()
      }
    })

    /* Close when focus or a click moves outside the bar. */
    document.addEventListener('click', function (e) {
      if (navbar && !navbar.contains(e.target)) setOpen(false)
    })

    /* Close when the viewport widens to the desktop breakpoint (where the menu
    is shown inline and the toggle is hidden), so it does not stay stuck open.
    Matches the 800px breakpoint in `_components.css`. */
    var desktop = window.matchMedia('(min-width: 800px)')
    desktop.addEventListener('change', function (e) {
      if (e.matches) setOpen(false)
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
